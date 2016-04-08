class LibraryView {
  constructor() {
    this.view = new View();
    this.headerTemplate = Hiof.Templates['library/header'];
    this.breadcrumbTemplate = Hiof.Templates['library/breadcrumb'];
    this.navbarTemplate = Hiof.Templates['library/navbar'];
    this.informationTemplate = Hiof.Templates['library/information'];
    this.searchTemplate = Hiof.Templates['library/search'];
    this.newsTemplate = Hiof.Templates['library/news'];
    this.postSingleTemplate = Hiof.Templates['articles/post-single'];
    this.postPostsTemplate = Hiof.Templates['articles/posts'];
    this.pageShowTemplate = Hiof.Templates['page/show'];
    this.boxTemplate = Hiof.Templates['library/box'];
    this.contentTemplate = Hiof.Templates['library/content'];
    this.defaults = {
      // These are the defaults.
      id: null,
      server: 'www2',
      url: 'http://hiof.no/api/v2/libraryservices/',
      template: null
    };
  }

  addToBreadcrumb(data = {}, breadcrumb = {}){
    data.breadcrumb = breadcrumb;
    return data;
  };

  renderLibrary(options = {}){
    let settings = Object.assign(
      {},
      this.defaults
    );
    //console.log(options);
    let indexRender = $.Event("indexrender");
    let that = this;
    this.view.getData(settings, that).success(function(data){
      console.log('Settings from renderLibrary');
      console.log(settings);
      console.log('Data from renderLibrary');
      console.log(data);
      // Populate templates with data
      let header = that.headerTemplate(data),
      breadcrumb = that.breadcrumbTemplate(data),
      navbar = that.navbarTemplate(data),
      content = that.contentTemplate(data);


      $('.library-portal').html(header + navbar + content + breadcrumb);
      $('.library-navigation').affix({
        offset: {
          top: 180,
          bottom: function() {
            return (this.bottom = $('.footer').outerHeight(true));
          }
        }
      });

      if ((options.template === 'article') || (options.template === 'articles')) {
        that.renderArticles(options);
      }else if (options.template === 'page') {
        that.renderPages(options);
      }else{

        $(window).trigger(indexRender);
      }


    });
  };

  renderIndex(options = {}) {
    let articleRender = $.Event("articlerender");
    let boxRender = $.Event("boxrender");
    let information = this.informationTemplate(),
    search = this.searchTemplate(),
    news = this.newsTemplate();
    $('.library-content').html(information + search + news);
    $(window).trigger(articleRender);
    $(window).trigger(boxRender);


  };
  renderArticles(options = {}) {
    let markup;
    let that = this;
    //this.renderLibrary(options);
    this.view.getData(options, that).success(function(data){
      if (options.template === 'article') {
        data.meta = options;
        markup = that.postSingleTemplate(data);
        let breadcrumb = that.breadcrumbTemplate(data);
        $('#library-breadcrumb').html(breadcrumb);
        $('.library-content').addClass('lo-auron-2-3').html(markup);
        that.view.scrollToElement('.library-portal');
      } else if (options.template === 'articles') {
        markup = that.postPostsTemplate(data);
        $('.library-content').html(markup);
      } else {
        markup = that.postPostsTemplate(data);
        $('.library-news .outlet').html(markup);
      }

    });

  };

  renderPages(options = {}) {
    let that = this;
    //console.log(that);

    let settings = Object.assign(
      {},
      this.defaults,
      options
    );


    this.view.getData(settings, that).success(function(data){
      data.meta = settings;
      if (data.page[0].specialfunction) {
        let accordionView = '<div id="accordion" data-footer="false" data-page-tree-id="'+ data.page[0].id +'"></div>';

        data.page[0].specialfunction = accordionView;
      }
      //console.log(data);
      let markup = this.pageShowTemplate(data);
      let breadcrumb = this.breadcrumbTemplate(data);
      //console.log(markup);
      $('.library-content').html(markup).addClass('lo-auron-2-3');
      $('#library-breadcrumb').html(breadcrumb);
      that.view.scrollToElement('.library-portal');
      Hiof.reloadAccordion();
      setTimeout(function(){
      if ($('#accordion').length) {
        $('.panel-collapse').first().collapse('show');
      }}, 100);
    });


  };
  renderBox(options = {}){

    let settings = Object.assign(
      {},
      this.defaults,
      options
    );
    let that = this;
    this.view.getData(settings, that).success(function(data){
      data.meta = options;
      markup = this.boxTemplate(data);
      $('.library-basic-info').html(markup);
    });
  };
}


(function(Hiof, undefined) {
  // On page load
  $(function(){
    let library = new LibraryView();
    //Handlebars.registerHelper('each_upto', function(ary, max, options) {
    //  if (!ary || ary.length === 0)
    //  return options.inverse(this);
    //
    //  var result = [];
    //  for (var i = 0; i < max && i < ary.length; ++i)
    //  result.push(options.fn(ary[i]));
    //  return result.join('');
    //});
    Handlebars.registerHelper('each_after', function(ary, max, options) {
      if (!ary || ary.length === 0)
      return options.inverse(this);

      var result = [];
      for (var i = max; i > 0 && i < ary.length; --i)
      result.push(options.fn(ary[i]));
      return result.join('');
    });
    Handlebars.registerHelper('compare', function(lvalue, operator, rvalue, options) {
      lvalue = lvalue.length;
      var operators, result;

      if (arguments.length < 3) {
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
      }

      if (options === undefined) {
        options = rvalue;
        rvalue = operator;
        operator = "===";
      }

      operators = {
        '==': function(l, r) {
          return l == r;
        },
        '===': function(l, r) {
          return l === r;
        },
        '!=': function(l, r) {
          return l != r;
        },
        '!==': function(l, r) {
          return l !== r;
        },
        '<': function(l, r) {
          return l < r;
        },
        '>': function(l, r) {
          return l > r;
        },
        '<=': function(l, r) {
          return l <= r;
        },
        '>=': function(l, r) {
          return l >= r;
        },
        'typeof': function(l, r) {
          return typeof l == r;
        }
      };

      if (!operators[operator]) {
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
      }

      result = operators[operator](lvalue, rvalue);

      if (result) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }

    });

    Handlebars.registerHelper('urlize', function(value) {
      return encodeURIComponent(value.replace(/\s+/g, '-').toLowerCase());
      //return value;
    });

    // Router


    Path.map("#/portal").to(function() {
      library.renderLibrary();
    });
    Path.map("#/portal/").to(function() {
      library.renderLibrary();
    });


    Path.map("#/:articletitle/a/:articleid").to(function() {
      var opt = {};
      opt.template = 'article';
      opt.pageId = this.params.articleid;
      opt.articleLoClass = 'lo-auron-2-3';
      //opt.articleDestinationAddressInternal = '#/biblioteket/aktuelt';
      opt.url = 'http://hiof.no/api/v1/articles/';
      //loadData(opt);
      library.renderLibrary(opt);
    });
    Path.map("#/:pagetitle/p/:pageid").enter(function() {

    }).to(function() {
      var opt = {};
      opt.template = 'page';
      opt.id = this.params.pageid;
      opt.url = 'http://hiof.no/api/v2/page/';
      //loadData(opt);
      library.renderLibrary(opt);
    });

    Path.map("#/aktuelt").to(function() {
      let opt = {};
      opt.template = 'articles';
      opt.url = 'http://hiof.no/api/v1/articles/';
      opt.category = '20';
      opt.articleLoClass = 'lo-quarter';
      opt.pageSize = '40';
      library.renderLibrary(opt);

    });
    Path.map("#/").to(function(){
      library.renderLibrary();
    });

    initatePathLibrary = function() {
      // Load root path if no path is active
      Path.root("#/portal");
    };

    if (typeof Hiof.meta === 'undefined') {
      Hiof.meta = {};
    }
    if ($('.library-portal').length) {
      //getData();
      initatePathLibrary();

      Path.listen();
    }

    $(document).on('click', '.library-portal a', function(e) {
      //e.preventDefault();
      var url = $(this).attr('href');
      if (url.substring(0, 2) == "#/") {
        //debug('String starts with #/');
      } else if (url.substring(0, 1) == "#") {
        hash = url + "";
        e.preventDefault();
        setTimeout(function() {
          //scrollToElement(hash);
        }, 200);

      }
    });


    //$(document).on('click', '.library-search-advanced-toggle', function(e) {
    //  e.preventDefault();
    //  $(this).toggleClass('btn-default').toggleClass('btn-primary');
    //  $('.library-search-simple').toggleClass('input-group').toggleClass('form-group');
    //  $('.form-horizontal  .control-label').toggleClass('sr-only');
    //  $('.library-search-simple-button').toggle();
    //  $('.library-search-advanced').toggleClass('visuallyhidden');
    //});
    //$(document).on('submit', '.form-horizontal', function(e){
    //  e.preventDefault();
    //  let data = $('.form-horizontal input').serialize();
    //  console.log("Searching for....");
    //  console.log(data);
    //  console.log("/Searching for....");
    //});



    $(window).on('indexrender', function (e) {
      library.renderIndex();
    });

    $(window).on('articlerender', function (e) {
      let opt = {};
      opt.template = 'article-index';
      opt.url = 'http://hiof.no/api/v1/articles/';
      opt.category = '20';
      opt.articleLoClass = 'lo-quarter';
      //opt.articleDestinationAddressInternal = '#/biblioteket/aktuelt';
      opt.pageSize = '4';


      library.renderArticles(opt);
    });


    $(window).on('pagerender', function (e) {
      library.renderPages();
    });


    $(window).on('boxrender', function (e) {

      var opt = {};
      opt.url = 'http://hiof.no/api/v1/box/';
      opt.server = "www2";
      opt.id = "1036";
      //loadData(opt);
      library.renderBox(opt);

    });

  });

})(window.Hiof = window.Hiof || {});
