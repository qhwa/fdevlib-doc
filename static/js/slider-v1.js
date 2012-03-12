(function(){
    var propertiesMap = {
        transformOriginX : 0,
        transformOriginY : 0,
        scaleX : 1,
        scaleY : 1,
        rotate : 0,
        translateX : 0,
        translateY : 0,
        skewX : 0,
        skewY : 0,
        originX : 0,
        originY : 0,
        matrix : [1,0,0,1,0,0]
    },
    exampleElement = $('example'),
    timer,
    transformPropertyModule = '',
    render = function(){
        var transformOriginCSSTex = propertiesMap['transformOriginX']+'px '+propertiesMap['transformOriginY']+'px',
        styleTex = createTransformProperty(),
        showCssTex = '-webkit-transform-origin: '+transformOriginCSSTex+';\n-o-transform-origin: '+transformOriginCSSTex+';\n-webkit-transform: '+styleTex+';\n-o-transform: '+styleTex+';';
        $D.setStyle(exampleElement, '-webkit-transform-origin', transformOriginCSSTex);
        $D.setStyle(exampleElement, '-o-transform-origin', transformOriginCSSTex);
        $D.setStyle(exampleElement, '-webkit-transform', styleTex);
        $D.setStyle(exampleElement, '-o-transform', styleTex);
        $('codeShowBox').innerHTML = showCssTex;
    },
    createTransformProperty = function(){
        var ret = [];

        ret.push('scale('+propertiesMap['scaleX']+','+propertiesMap['scaleY']+')');
        ret.push('rotate('+propertiesMap['rotate']+'deg)');
        ret.push('translate('+propertiesMap['translateX']+'px,'+propertiesMap['translateY']+'px)');
        ret.push('skew('+propertiesMap['skewX']+'deg,'+propertiesMap['skewY']+'deg)');
        ret.push('matrix('+propertiesMap['matrix'].join(',')+')');
        return ret.join(' ');
    },
    changeProperties = function(name, value, showElement){
        var v = Math.floor(value);
        if(/matrix/.test(name)){
            propertiesMap['matrix'][name.split('-')[1]] = value;
        }
        else{
            propertiesMap[name] = value;
        }
        if(value-v===0){
            value = v;
        }
        showElement.innerHTML = value;
    },
    init = function(){
        $E.delegate('settingArea','change', function(e) {
            var that = this,
            propertyName = that.getAttribute('data-property'),
            propertyValue = parseFloat(that.value).toFixed(1),
            showEl = $D.getNextSibling(that);
            changeProperties(propertyName, propertyValue, showEl);
        render();
        },  'input[type="range"]');
    }();
})();