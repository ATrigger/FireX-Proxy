if (!com) var com = {};
if (!com.firexProxyPackage) com.firexProxyPackage = {};

com.firexProxyPackage = {
    PING_TIMES: 10, // const
    proxyList: [],
    prefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch),
    stringBundle: null,
    ip_address: null,
    proxyManager: null,

    onLoad: function (str) {
        this.stringBundle = str;

        if (this.isFirstRun()) {
            /* icon */
            this.addIcon("nav-bar", "proxy-toolbar-button");
            this.addIcon("addon-bar", "proxy-toolbar-button");
            /* ip address */
            this.addIcon("nav-bar", "ip-address");
            this.addIcon("addon-bar", "ip-address");
        }
    },
    addIcon: function (toolbarId, id) {
        if (!document.getElementById(id)) {
            var toolbar = document.getElementById(toolbarId);
            toolbar.insertItem(id, null);
            toolbar.setAttribute("currentset", toolbar.currentSet);
            document.persist(toolbar.id, "currentset");

            if (toolbarId == "addon-bar") {
                toolbar.collapsed = false;
            }
        }
    },
    activate: function () {
        this.reset();
        var self = this;
        this.parseProxyList(function (ip_addr) {
            var rand_proxy = self.randomProxy(ip_addr);
            self.proxyManager.start(rand_proxy[0], rand_proxy[1], rand_proxy[3]);
            self.ip_address.children[0].value = self.getIPAddress();
            self.proxyList = ip_addr;
            self.addItemsToProxyList();
        });
    },
    disable: function () {
        this.proxyManager.stop();
        this.reset();
    },
    reset: function () {
        if (this.ip_address) {
            this.ip_address.children[0].style.color = '#12B300';
            this.ip_address.children[0].value = this.stringBundle.getString('proxyIsDisabled');
        }
    },
    ping: function () {
        var self = this;
        this.pingLogic(function (times) {
            if (self.ip_address) {
                self.ip_address.children[0].value = self.getIPAddress();
                self.ip_address.children[0].style.color = (times < self.PING_TIMES) ? '#12B300' : '#B30000';
            }
        });
    },
    chooseProxy: function (event) {
        var proxy_list = document.getElementById('proxy-list-box');
        if (proxy_list) {
            var hbox_elements = proxy_list.childNodes;

            if (hbox_elements) {
                for (var i = 0; i < hbox_elements.length; i++) {
                    if (hbox_elements[i].className == 'active') {
                        var checkBox = hbox_elements[i].getElementsByClassName('checkbox-square');

                        if (checkBox.length) {
                            var this_class = checkBox[0].getAttribute('class');
                            if (this_class.indexOf('active') != -1) {
                                checkBox[0].setAttribute('class', this_class.substring(0, this_class.indexOf('active') - 1));
                            }
                        }

                        if (hbox_elements[i] == event.currentTarget) break;

                        hbox_elements[i].removeAttribute('class');
                        break;
                    }
                }
            }
        }

        if (!event.currentTarget.className.length) {
            event.currentTarget.setAttribute('class', 'active');
            var checkBox = event.currentTarget.getElementsByClassName('checkbox-square');
            if (checkBox.length) {
                checkBox[0].setAttribute('class', checkBox[0].getAttribute('class') + ' ' + 'active');
            }

            this.changeProxy();
        } else {
            event.currentTarget.removeAttribute('class');
            this.disable();
        }
    },
    changeProxy: function () {
        var hbox = document.getElementById('proxy-list-box').getElementsByTagName('hbox');

        for (var i = 0; i < hbox.length; i++) {
            if (hbox[i].className.length) {
                var hbox_child = hbox[i].getElementsByClassName('proxy-address');
                var proxy_type = hbox[i].getElementsByClassName('proxy-type');

                if (hbox_child.length && proxy_type.length) {
                    this.proxyManager.start(hbox_child[0].value, hbox_child[0].getAttribute('data-port'), proxy_type[0].innerHTML.toLowerCase());
                    document.getElementById('ip-address').children[0].value = this.getIPAddress();
                }
                break;
            }
        }
    },
    refresh: function () {
        this.reset();
        this.removeProxyList();
        var self = this;
        this.parseProxyList(function (ip_addr) {
            self.proxyList = ip_addr;
            self.addItemsToProxyList();

            if (!ip_addr.length) {
                document.getElementById('proxy-message').innerHTML = self.stringBundle.getString('didntRespond');
            }
        });

        document.getElementById('proxy-message').style.display = 'none';
        var doc_box = document.getElementById('proxy-list-box');
        if (doc_box) {
            var list_class = doc_box.getAttribute('class');
            if (list_class.indexOf('loading') == -1) {
                doc_box.setAttribute('class', list_class + ' ' + 'loading');
            }
        }
    },
    getIPAddress: function () {
        return this.proxyManager.proxyData.enabled ? this.proxyManager.proxyData.address : this.stringBundle.getString('proxyIsDisabled');
    },
    randomProxy: function (proxy) {
        return proxy[parseInt(Math.random() * proxy.length - 1)];
    },
    pingLogic: function (callback) {
        var self = this;
        var xhr = new XMLHttpRequest();
        var win = window.open("chrome://FireX/content/loading.xul", "", "chrome");
        var pinged = 0;
        win.onload = function () {
            win.document.getElementById('loading_description').value = self.stringBundle.getString('waitCheckSpeed');
        };

        var interval = setInterval(function () {
            win.document.getElementById('loading_description').value = self.stringBundle.getString('doneSeconds') + ': ' + parseInt(self.PING_TIMES - pinged) + ' ' + self.stringBundle.getString('seconds');

            if (pinged >= self.PING_TIMES) {
                win.close();
                clearInterval(interval);
                xhr.abort();
                return callback(pinged);
            }

            pinged++;
        }, 1000);

        xhr.open('GET', 'http://www.mozilla.org/', true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                win.close();
                clearInterval(interval);
                callback(pinged);
            }
        };
        xhr.send(null);
    },
    addItemsToProxyList: function () {
        for (var i = 0; i < this.proxyList.length; i++) {
            this.addProxyItem(this.proxyList[i][0], this.proxyList[i][1], this.proxyList[i][2], this.proxyList[i][3]);
        }
    },
    removeProxyList: function () {
        var proxy_list = document.getElementById('proxy-list-box');

        while (proxy_list.firstChild) proxy_list.removeChild(proxy_list.firstChild);
    },
    renderSettings: function () {
        var template_list = document.getElementById('templates-list');
        if (template_list) {
            if (!template_list.childNodes.length) {
                for (var i = 0; i < this.proxyManager.uriList.length; i++) {
                    if (this.proxyManager.uriList[i].length) this.addTemplate(this.proxyManager.uriList[i]);
                }
            }
        }
    },
    removeTemplate: function (tmpl, uniqueId) {
        if (this.proxyManager.uriList.length) {
            var uriIndex = this.proxyManager.uriList.indexOf(tmpl);
            if (uriIndex != -1) {
                var unEl = document.getElementById(uniqueId);

                if (unEl) document.getElementById('templates-list').removeChild(unEl.parentNode);

                this.proxyManager.uriList.splice(uriIndex, 1);
                new FileReader().fileDescriptor().removeLine(tmpl);
            }
        }
    },
    validateTemplate: function () {
        var tmpl_input = document.getElementById('template-input');

        if (tmpl_input) {
            if (tmpl_input.value.length) {
                this.newTemplate(tmpl_input.value);

                tmpl_input.value = '';
            }
        }
    },
    enableTemplates: function (checkBox) {
        var checkBox_class = checkBox.getAttribute('class');
        if (checkBox_class.indexOf('active') != -1) {
            checkBox.setAttribute('class', checkBox_class.substring(0, checkBox_class.indexOf('active') - 1));
            this.proxyManager.templateEnabled = false;
        } else {
            checkBox.setAttribute('class', checkBox_class + ' ' + 'active');
            this.proxyManager.templateEnabled = true;
        }
    },
    newTemplate: function (tmpl) {
        new FileReader().fileDescriptor().write(tmpl, true);
        this.proxyManager.uriList.push(tmpl);
        this.addTemplate(tmpl);
    },
    parseProxyList: function (callback) {
        var req = new XMLHttpRequest();
        req.open('GET', 'http://proxylist.hidemyass.com/', true);
        req.onreadystatechange = function () {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    var doc = new DOMParser().parseFromString(req.responseText, "text/html");
                    var ip_addr = [];
                    var doc_table = doc.getElementById("listable");

                    if (doc_table != undefined) {
                        var doc_tr = doc_table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

                        for (var i = 0; i < doc_tr.length; i++) {
                            var doc_td = [];

                            for (var d = 0; d <= 5; d++) doc_td.push(doc_tr[i].getElementsByTagName("td")[d + 1]);

                            var span = doc_td[0].getElementsByTagName('span')[0];
                            var loopAddr = [];
                            var proxyCondition = {
                                proxySpeed: parseInt(doc_td[3].getElementsByClassName('progress-indicator')[0].children[0].style.width),
                                connectionTime: parseInt(doc_td[4].getElementsByClassName('progress-indicator')[0].children[0].style.width),
                                country: doc_td[2].getElementsByTagName('span')[0].textContent,
                                proxyType: doc_td[5].innerHTML.toLowerCase()
                            };

                            if (proxyCondition.connectionTime < 60 || proxyCondition.proxySpeed < 40) continue;

                            if (proxyCondition.proxyType != 'http' && proxyCondition.proxyType != 'https') continue;

                            var match = span.getElementsByTagName('style')[0].innerHTML.match(/([^\n|.]+display:(?!none))/g),
                                allElements = span.childNodes;

                            for (var b = 0; b < allElements.length; b++) {
                                var this_span = allElements[b],
                                    isLoop = false;

                                if (this_span.textContent.length && this_span.tagName == undefined) {
                                    loopAddr.push(this_span.textContent);
                                    continue;
                                }

                                if (this_span.style.display == "none") continue;

                                if (this_span.tagName.toLowerCase() == 'style') continue;

                                if (this_span.className.length) {
                                    for (var r = 0; r < match.length; r++) {
                                        if (match[r].replace(/{.*/, '') == this_span.className) {
                                            isLoop = true;
                                            break;
                                        }
                                    }
                                }

                                if (!this_span.innerHTML.length || this_span.innerHTML === '.') continue;

                                if (!this_span.className.match(/^[0-9]+$/) && !isLoop && !this_span.style.display) continue;

                                loopAddr.push(this_span.innerHTML);
                            }

                            ip_addr.push([
                                loopAddr.join('.').replace(/\.{2,}/g, '.'),
                                doc_td[1].innerHTML.replace(/\s/g, ''),
                                proxyCondition.country,
                                proxyCondition.proxyType
                            ]);
                        }
                    }

                    callback(ip_addr);
                }

                var doc_box = document.getElementById('proxy-list-box');
                if (doc_box) {
                    var list_class = doc_box.getAttribute('class');
                    if (list_class.indexOf('loading') != -1) {
                        doc_box.setAttribute('class', list_class.substring(0, list_class.indexOf('loading') - 1));
                    }
                }
            }
        };
        req.send(null);
    },
    openList: function () {
        this.openPopup('proxy-list-panel');
    },
    openSettings: function () {
        this.openPopup('settings-panel');
    },
    openPopup: function (str_element) {
        var panel = document.getElementById(str_element);
        if (panel) {
            panel.openPopup(document.getElementById('proxy-toolbar-button'), 'after_end', 0, 0, false, false);
        }
    },
    isFirstRun: function () {
        var firstRun = this.prefs.getBoolPref('extensions.firex.firstRun'), currentVersion = 3.8;

        if (firstRun) {
            this.prefs.setBoolPref('extensions.firex.firstRun', false);
            this.prefs.setCharPref('extensions.firex.installedVersion', currentVersion);
        }

        if (parseFloat(this.prefs.getCharPref('extensions.firex.installedVersion')) < currentVersion) {
            this.prefs.setCharPref('extensions.firex.installedVersion', currentVersion.toString());
            return true;
        }

        return firstRun;
    },
    addProxyItem: function (value, port, country, type) {
        var self = this;
        var xulNS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
        var hbox = document.createElementNS(xulNS, 'hbox');
        hbox.addEventListener('click', function (evt) {
            self.chooseProxy(evt);
        }, false);

        var checkbox = document.createElementNS('http://www.w3.org/1999/xhtml', 'html:div');
        checkbox.setAttribute('class', 'checkbox-square');

        var element = document.createElementNS(xulNS, 'label');
        element.setAttribute('class', 'proxy-address');
        element.setAttribute('value', value);
        element.setAttribute('data-port', port);

        var el_country = document.createElementNS(xulNS, 'label');
        el_country.textContent = country;
        el_country.setAttribute('class', 'proxy-country');

        var el_type = document.createElementNS(xulNS, 'label');
        el_type.textContent = type.toUpperCase();
        el_type.setAttribute('class', 'proxy-type');

        document.getElementById('proxy-list-box').appendChild(hbox);
        hbox.appendChild(checkbox);
        hbox.appendChild(element);
        hbox.appendChild(el_type);
        hbox.appendChild(el_country);
    },
    addTemplate: function (template) {
        var self = this;
        var w3c = 'http://www.w3.org/1999/xhtml';
        var settingsTemplate = document.createElementNS(w3c, 'html:div');
        settingsTemplate.setAttribute('class', 'settings-template');

        var wrap_template = document.createElementNS(w3c, 'html:div');
        wrap_template.style.float = 'left';
        wrap_template.setAttribute('class', 'list-style-arrow');

        var image_tmp = document.createElementNS(w3c, 'html:img');
        image_tmp.setAttribute('src', 'chrome://FireX/skin/icons/icon-remove.png');
        image_tmp.setAttribute('alt', 'rm');
        image_tmp.setAttribute('id', 'rm' + Math.random() * Math.pow(2, 31));

        image_tmp.addEventListener('click', function () {
            self.removeTemplate(template, this.getAttribute('id'));
        }, false);

        var textNode_tmp = document.createTextNode(template);

        wrap_template.appendChild(textNode_tmp);

        settingsTemplate.appendChild(wrap_template);
        settingsTemplate.appendChild(image_tmp);

        var template_list = document.getElementById('templates-list');
        if (template_list) {
            template_list.appendChild(settingsTemplate);
        }
    }
};

com.firexProxyPackage.proxyManager = new ProxyManager();
new FileReader().fileDescriptor().readAll(function (data) {
    if (data) {
        com.firexProxyPackage.proxyManager.uriList = data;
    }
});

window.addEventListener("load", function (e) {
    com.firexProxyPackage.onLoad(document.getElementById('firex-string-bundle'));

    var ip_address = document.getElementById('ip-address');
    var tmplEnable = document.getElementById('tmpl-enable');

    if (ip_address) {
        ip_address.children[0].value = com.firexProxyPackage.getIPAddress();
        com.firexProxyPackage.ip_address = ip_address;
    }

    if (tmplEnable) {
        tmplEnable.addEventListener('click', function () {
            com.firexProxyPackage.enableTemplates(this);
        });
    }
}, false);