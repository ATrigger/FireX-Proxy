class ListView extends Backbone.View
  initialize: ->
    @listenTo @collection, 'reset', @addAll
    @listenTo @collection, 'change:favoriteState', @onChange
    @listenTo @collection, 'change:activeState', @onStateChange

    @listenTo @model, 'change:isFavoriteEnabled', @onCheckboxChange
    @listenTo @model, 'change:refreshProcess', @onRefreshProcess

    addon.port.on 'onList', (response) =>
      @onList response

    addon.port.on 'onCreateFavorite', (response) =>
      @onCreateFavorite response

    @template = _.template $('#list-template').html()

  events: ->
    'click .refresh'  : 'update'
    'click .checkbox' : 'toggleFavorites'
    'click .filter'   : 'toggleFilters'

  render: ->
    $(@el).html @template @model.toJSON()

    @delegateEvents()

    @$table   = @$ '#proxy-list-box'
    @$content = @$ '.content-wrapper'
    @$filters = @$ '.filters'

    @addAll()
    @update() if (!@collection.length and !@model.get 'isFavoriteEnabled')

    return @

  update: ->
    @collection.fetch()
    @model.startRefreshProcess()

    @$table.empty()

  addOne: (proxy) ->
    view = new ProxyView model: proxy
    @$table.append view.render().el

  addAll: ->
    @$table.empty()

    _.each(@collection.where(favoriteState: @model.get 'isFavoriteEnabled'), @addOne, @)

  onList: (list) ->
    activeElement = @collection.filter (item) -> item.get 'activeState'

    @collection.reset _.union activeElement, list
    
    @model.stopRefreshProcess()

  onCreateFavorite: (proxy) ->
    @collection.add proxy

  onCheckboxChange: (model, value, options) ->
    @render()

  onRefreshProcess: (model, value, options) ->
    @$content.toggleClass 'spinner', value

  toggleFavorites: ->
    @model.set 'isFavoriteEnabled', !@model.get 'isFavoriteEnabled'

  toggleFilters: ->
    @$filters.toggle()

  onStateChange: (model, value, options) ->
    _.each(@collection.without(model), (proxy) -> proxy.set 'activeState', false) if model.get 'activeState'

  onChange: (model, value, options) ->
    if value is true
      model.save
        activeState: false

    model.destroy()
    @render()