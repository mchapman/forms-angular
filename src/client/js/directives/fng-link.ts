/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />

module fng.directives {

  /*@ngInject*/
  export function fngLink(routingService, SubmissionsService): angular.IDirective {
    return {
      restrict: 'E',
      scope: {dataSrc: '&model'},
      link: function (scope, element, attrs) {
        const ref = attrs['ref'];
        const isLabel = attrs['text'] && (unescape(attrs['text']) !== attrs['text']);
        var form: string = attrs['form'];
        scope['readonly'] = attrs['readonly'];
        form = form ? form + '/' : '';

        if (isLabel) {
          let workScope = scope;
          let workString = '';
          while (typeof workScope['baseSchema'] !== "function" && workScope.$parent) {
            if (typeof workScope['$index'] !== "undefined") {
              throw new Error('No support for $index at this level - ' + workString);
            }
            workScope = workScope.$parent;
            workString = workString + '$parent.';
          }
          let attrib = attrs['fld'];
          if (typeof workScope['$index'] !== "undefined") {
            let splitAttrib = attrib.split('.');
            attrib = splitAttrib.pop();
            attrib = splitAttrib.join('.') + '[' + workScope['$index'] + '].' + attrib;
          }
          var watchRecord = scope.$watch(workString + 'record.' + attrib, function (newVal: any) {
            if (newVal) {
              if (/^[a-f0-9]{24}/.test(newVal.toString())) {
                newVal = newVal.slice(0,24);
              }
              else if (newVal.id && /^[a-f0-9]{24}/.test(newVal.id)) {
                newVal = newVal.id.slice(0,24);
              }
              else if (scope.$parent["f_" + attrs['fld'] + "Options"]) {
                // extract from lookups
                var i = scope.$parent["f_" + attrs['fld'] + "Options"].indexOf(newVal);
                if (i > -1) {
                  newVal = scope.$parent["f_" + attrs['fld'] + "_ids"][i];
                }
                else {
                  newVal = undefined;
                }
              }
              else {
                newVal = undefined;
              }
              if (newVal) {
                scope['link'] = routingService.buildUrl(ref + '/' + form + newVal + '/edit');
              }
              else {
                scope['link'];
              }
            }
            else {
              scope['link'] = undefined;
            }
          }, true);
        }



        if (isLabel) {
          let watchRecord = scope.$watch('$parent.record.' + attrs['fld'], (newVal) => {
            if (newVal) {
              if (/^[a-f0-9]{24}$/.test(newVal.toString())) {
              } else if(scope.$parent[`f_${attrs['fld']}Options`]) {
                // extract from lookups
                let i = scope.$parent[`f_${attrs['fld']}Options`].indexOf(newVal);
                if (i > -1) {
                  newVal = scope.$parent[`f_${attrs['fld']}_ids`][i];
                } else {
                  newVal = undefined;
                }
              } else {
                newVal = undefined;
              }
              if (newVal) {
                scope['link'] = routingService.buildUrl(ref + '/' + form + newVal + '/edit');
              } else {
                scope['link']
              }
            } else {
              scope['link'] = undefined;
            }
          }, true);
        } else {
          if (attrs['text'] && attrs['text'].length > 0) {
            scope['text'] = attrs['text'];
          }
          var index = scope['$parent']['$index'];
          scope.$watch('dataSrc()', function(newVal) {
            if (newVal) {
              if (typeof index !== 'undefined' && angular.isArray(newVal)) {
                newVal = newVal[index];
              }
              scope['link'] = routingService.buildUrl(ref + '/' + form + newVal + '/edit');
              if (!scope['text']) {
                SubmissionsService.getListAttributes(ref, newVal).then(function(response) {
                  let data: any = response.data;
                  if (data.success === false) {
                    scope['text'] = data.err;
                  } else {
                    scope['text'] = data.list;
                  }
                }, function(response) {
                  scope['text'] = 'Error ' + response.status + ': ' + response.data;
                });
              }
            }
          }, true);
        }
      },
      template: function (element, attrs) {
        // return attrs.readonly ? '<span class="fng-link">{{text}}</span>' : '<a href="{{ link }}" class="fng-link">{{text}}</a>';
        let retVal: string;
        if (attrs.readonly) {
          retVal = '<span class="fng-link">{{text}}</span>';
        } else if (attrs['text'] && unescape(attrs['text']) !== attrs['text']) {
          retVal = `<a href="{{ link }}" class="fng-link">${unescape(attrs['text'])}</a>`
          // retVal = '<a href="{{ link }}" class="fng-link">{{text}}</a>';
        } else {
          retVal = '<a href="{{ link }}" class="fng-link">{{text}}</a>';
        }
        return retVal;
      }
    };
  }
}
