Ext.BLANK_IMAGE_URL='http://matrix/work/javascript/ext/pro-snippets/images/s.gif';
ApiPanel=function() {
    ApiPanel.superclass.constructor.call(this,{
        id: 'api-tree',
        region: 'west',
        split: true,
        header: false,
        width: 280,
        minSize: 175,
        maxSize: 500,
        collapsible: true,
        margins: '0 0 5 5',
        cmargins: '0 0 0 0',
        rootVisible: false,
        lines: false,
        autoScroll: true,
        animCollapse: false,
        animate: false,
        collapseMode: 'mini',
        loader: new Ext.tree.TreeLoader({
            preloadChildren: true,
            clearOnLoad: false
        }),
        root: new Ext.tree.AsyncTreeNode({
            text: 'FD',
            id: 'FD',
            expanded: true,
            children: Docs.contents
        }),
        collapseFirst: false
    });
    // no longer needed!
    //new Ext.tree.TreeSorter(this, {folderSort:true,leafAttr:'isClass'});

    this.getSelectionModel().on('beforeselect',function(sm,node) {
        return node.isLeaf();
    });
};

Ext.extend(ApiPanel,Ext.tree.TreePanel,{
    initComponent: function() {
        this.hiddenPkgs=[];
        Ext.apply(this,{
            tbar: [' ',
			new Ext.app.FilterField({
			    id: 'txtFilter',
			    width: 200,
			    emptyText: 'Keywords...',
			    enableKeyEvents: true,
			    listeners: {
			        render: function(f) {
			            this.filter=new Ext.tree.TreeFilter(this,{
			                clearBlank: true,
			                autoClear: true
			            });
			        },
			        keydown: {
			            fn: this.filterTree,
			            buffer: 350,
			            scope: this
			        },
			        scope: this
			    }
			}),'->',
			{
			    iconCls: 'icon-expand-all',
			    tooltip: 'Expand All',
			    handler: function() { this.root.expand(true); },
			    scope: this
			},'-',{
			    iconCls: 'icon-collapse-all',
			    tooltip: 'Collapse All',
			    handler: function() { this.root.collapse(true); },
			    scope: this}],
            bbar: [' ',
			new Ext.form.Checkbox({
			    id: 'cbxTabs',
			    boxLabel: '启用标签浏览'
			})
			]
        });
        ApiPanel.superclass.initComponent.call(this);
    },
    filterTree: function(t,e) {
        if(t.el.dom.value)
            t.trigger.show();
        var text=t.getValue();
        Ext.each(this.hiddenPkgs,function(n) {
            n.ui.show();
        });
        if(!text) {
            this.filter.clear();
            this.collapseAll();
            return;
        } else
            this.expandAll();

        var re=new RegExp(Ext.escapeRe(text),'i');
        this.filter.filterBy(function(n) {
            return !n.attributes.isClass||re.test(n.text);
        });

        // hide empty packages that weren't filtered
        this.hiddenPkgs=[];
        var me=this;
        this.root.cascade(function(n) {
            if(!n.attributes.isClass&&n.ui.ctNode.offsetHeight<3) {
                n.ui.hide();
                me.hiddenPkgs.push(n);
            }
        });
    },
    /*
    * 定位当前页对应的树节点
    */
    selectClass: function(node) {
        var split=window.location.href.split('#');
        window.location.href=split[0]+'#class='+node.id;
        var parts=node.id.split('.');
        var levels=[];
        for(var i=0,j=parts.length;i<j;i++) { // things get nasty - static classes can have .
            levels.push(parts.slice(0,i+1).join('.'));
        }
        this.selectPath('/FD/'+levels.join('/'));
    }
});


DocPanel=Ext.extend(Ext.Panel,{
    autoScroll: true,

    initComponent: function() {
        var ps=this.cclass.split('.');
        Ext.apply(this,{
            tbar: ['->',{
                text: '收藏该标签页',
                handler: this.directLink,
                scope: this,
                iconCls: 'icon-fav'
            }
            ]
        });
        DocPanel.superclass.initComponent.call(this);
    },

    directLink: function() {
        var link=String.format(
            "<a href=\"{0}\" target=\"_blank\">{0}</a>",
            window.location.href
        );
        Ext.Msg.alert('直接访问地址：'+this.cclass,link);
    }
});



MainPanel=function() {
    MainPanel.superclass.constructor.call(this,{
        id: 'center',
        region: 'center',
        margins: '0 5 5 0',
        resizeTabs: true,
        minTabWidth: 135,
        tabWidth: 135,
        enableTabScroll: true
        //        activeTab: 0,
        //        items: new DocPanel({
        //            id: 'fd-Home',
        //            title: 'Fdev Home',
        //            cclass: 'Home',
        //            //autoLoad: { url: 'home.html' },
        //            iconCls: 'icon-home',
        //            autoScroll: true
        //        })
    });
};

Ext.extend(MainPanel,Ext.TabPanel,{

    initEvents: function() {
        MainPanel.superclass.initEvents.call(this);
    },
    loadClass: function(node) {
        var cbxTabs=Ext.getCmp('cbxTabs'),
            isTabs=cbxTabs.getValue(),
            id='fd-'+node.id;
        if(!isTabs) id='fd-Home'
        var tab=this.getComponent(id),
            split=window.location.href.split('#'),
            autoLoad={
                url: node.attributes.href,
                nocache: true,
                scripts: false,
                callback: function() {
                    SyntaxHighlighter.highlight();
                }
            };
        window.location.href=split[0]+'#class='+node.id;
        if(tab) {
            if(!isTabs) {
                tab.el.dom.id=id;
                tab.setTitle(node.attributes.text);
                tab.setIconClass(node.attributes.iconCls);
                tab.load(autoLoad);
                api.selectClass(node);
            }
            this.setActiveTab(tab);
        } else {
            var p=this.add(new DocPanel({
                id: id,
                title: node.attributes.text,
                cclass: node.id,
                html: String.format('<iframe src="{0}"></iframe>',node.attributes.href),
                closable: id=='fd-Home'?false:true,
                iconCls: node.attributes.iconCls
            }));
            this.setActiveTab(p);
        }
    }
});

var api,mainPanel,isTabs;
Ext.onReady(function() {
    SyntaxHighlighter.defaults['auto-links']=false;
    SyntaxHighlighter.config.clipboardSwf='images/clipboard.swf';

    Ext.QuickTips.init();
    api=new ApiPanel();
    mainPanel=new MainPanel();

    api.on('click',function(node,e) {
        if(node.isLeaf()) {
            e.stopEvent();
            mainPanel.loadClass(node);
        }
    });

    var viewport=new Ext.Viewport({
        layout: 'border',
        items: [
        //        {
        //            cls: 'fd-header',
        //            height: 40,
        //            region: 'north',
        //            xtype: 'box',
        //            el: 'north',
        //            border: false,
        //            margins: '0 0 5 0'
        //        },
        api,mainPanel]
    });
    viewport.doLayout();
    //change with tree synchronism
    mainPanel.on('tabchange',function(tp,tab) {
        var node=api.getNodeById(tab.cclass);
        if(node) api.selectClass(node);
    });
    //init checkbox
    var cbxTabs=Ext.getCmp('cbxTabs');
    isTabs=Ext.util.Cookies.get('ext-istabs')=='true';
    cbxTabs.setValue(isTabs);
    cbxTabs.on('check',function(f,n,o) {
        var now=new Date();now.setFullYear(now.getFullYear()+1);
        Ext.util.Cookies.set('ext-istabs',n,now);
    });
    // allow for link in
    var split=window.location.href.split('#'),ps={},cls='Home';
    if(split.length>1) {
        ps=Ext.urlDecode(split[1]);
        cls=ps['class']||cls;
    }
    if(isTabs) {
        var homeNode=api.getNodeById('Home');
        mainPanel.loadClass(homeNode);
    }
    var node=api.getNodeById(cls);
    if(node) mainPanel.loadClass(node);


    setTimeout(function() {
        Ext.get('loading').remove();
        Ext.get('loading-mask').fadeOut({ remove: true });
    },250);
    Ext.getCmp('txtFilter').focus();
});
Ext.app.FilterField=Ext.extend(Ext.form.TriggerField,{
    initComponent: function() {
        Ext.app.FilterField.superclass.initComponent.call(this);
    },
    triggerClass: 'x-form-clear-trigger',
    hideTrigger: true,
    validationEvent: false,
    validateOnBlur: false,

    onTriggerClick: function() {
        this.el.dom.value='';
        this.trigger.hide();
        this.focus();
        this.fireEvent('keydown',this);
    }
});
