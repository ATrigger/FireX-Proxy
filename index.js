const { FreeProxyList }   = require('./addon/FreeProxyList.js');
const { ActionButton }    = require("sdk/ui/button/action");
const { Panel }           = require("sdk/panel");
const { Address }         = require('./addon/Address.js');
const { Connector }       = require('./addon/Connector.js');
const { TemplateManager } = require('./addon/TemplateManager.js');
const { FavoriteManager } = require('./addon/FavoriteManager.js');
const { JsonReader }      = require('./addon/JsonReader.js');
const { Template }        = require('./addon/Template.js');
const self                = require('sdk/self');

const panel = Panel({
    contentURL: './html/index.html',
    height: 350,
    width: 400
});

const actionButton = ActionButton({
    id: "firex-action",
    label: "FireX Proxy",
    icon: {
        "16": "./icons/icon-16.png",
        "24": "./icons/icon-24.png",
        "32": "./icons/icon-32.png"
    },
    onClick: () => {
        panel.show({
            position: actionButton
        });
    }
});

const templatesStream = new JsonReader('firex-templates');
const proxyStream     = new JsonReader('firex-proxy');
const templateManager = new TemplateManager(templatesStream);
const connector       = new Connector(templateManager);
const favoriteManager = new FavoriteManager(proxyStream);

panel.port
    .on("connect", (server) =>
        connector.start(
            (new Address())
                .setIPAddress(server.ipAddress)
                .setPort(server.port)
                .setProxyProtocol(server.protocol)
                .setCountry(server.country)
        )
    ).on("disconnect", () =>
        connector.stop()
    ).on("blacklist.create", (pattern) =>
        panel.port.emit('onCreatePattern', templateManager.add(new Template(pattern.address)))
    ).on("blacklist.read", () =>
        panel.port.emit("onPattern", templateManager.all())
    ).on("blacklist.delete", (sync) =>
        templateManager.rm(sync.id)
    ).on("blacklist.update", (sync) =>
        templateManager.modify(sync.id, new Template(sync))
    ).on("favorite.read", async () => {
        connector.stop();

        let proxyList = await FreeProxyList.getList();

        panel.port.emit("onList", proxyList.concat(favoriteManager.all()));
    }).on("favorite.create", (proxy) =>
        panel.port.emit('onCreateFavorite', favoriteManager.add(proxy))
    ).on("favorite.delete", (sync) =>
        favoriteManager.rm(sync.id)
    ).on("toggleTemplate", (state) =>
        templateManager.setTemplateState(state)
    );

exports.onUnload = function (reason) {
    switch (reason) {
        case 'uninstall':
        case 'upgrade':
            templatesStream.deleteFile();
            proxyStream.deleteFile();

            break;
    }
};