class ProxyList extends Backbone.Collection
  constructor: (options) ->
    super options

    @model = ProxyStateModel

  initialize: ->
    @port = 'favorite'

  byCountry: (countryName) ->
    new this(
      this.where
        country: countryName
    )

  byProtocol: (protocolName) ->
    new this(
      this.where
        originalProtocol: protocolName
    )