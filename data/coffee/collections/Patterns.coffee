class Patterns extends Backbone.Collection
  constructor: (options) ->
    super options

    @model = ProxyStateModel

  initialize: ->
    @port = 'blacklist'