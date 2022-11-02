export default [ { name: 'ds-text-editor', html: `<template>
  <div>
    <div>
      <div @mount="createTextEditor">
        Weird <span>sup</span> thing
      </div>
      <div @mount="createTextEditor">Sup</div>
      <div @mount="createTextEditor"></div>
    </div>
    <div></div>
    <div ds-widget-section="true">
      <h1>Hello world</h1>
      <div @mount="createTextEditor"></div>
      <div @mount="createTextEditor">Sup</div>
    </div>
  </div>
  test
</template>

<script>
  return {
    id: 'dsTextEditor',
    name: 'Text editor',
    description: 'Rich text editor',
    version: 1,
    methods: {
      createTextEditor: {
        actions: [
          {
            type: 'pluginAction',
            name: 'dsTextEditor/create',
            paramType: 'object',
            _$computedParams: true,
            params: [
              ['elementId', {
                _$computed: true,
                name: 'getter/this/value',
                params: {
                  key: 'elementId'
                }
              }],
              ['instanceId', {
                _$computed: true,
                name: 'getter/this/value',
                params: {
                  key: 'instanceId'
                }
              }],
            ]
          }
        ]
      }
    }
  }
</script>` }, 
 ]