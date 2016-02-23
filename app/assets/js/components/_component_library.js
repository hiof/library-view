class LibraryView {
  constructor() {
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
  }

  getData(options = {}){
    var defaults = {
      // These are the defaults.
      id: null,
      server: 'www2',
      url: 'http://hiof.no/api/v2/libraryservices/',
      template: null
    };
    // Merge settings with defaults and options
    let settings = Object.assign(
      {},
      defaults,
      options
    );

    let contentType = "application/x-www-form-urlencoded; charset=utf-8";

    if (window.XDomainRequest) { //for IE8,IE9
      contentType = "text/plain";
    }
    // Return data
    return $.ajax({
      url: settings.url,
      method: 'GET',
      async: true,
      dataType: 'json',
      data: settings,
      contentType: contentType,
      context: this,
      success: function(data) {
        return data;
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert("You can not send Cross Domain AJAX requests: " + errorThrown);
      }

    });

  }
  renderIndex(options = {}) {

    this.getData(options).success(function(data){

      // Populate templates with data
      let header = this.headerTemplate(data),
          breadcrumb = this.breadcrumbTemplate(data),
          navbar = this.navbarTemplate(data),
          information = this.informationTemplate(data),
          search = this.searchTemplate(data),
          news = this.newsTemplate(data);


      $('.library-portal').removeClass('lo-auron-2-3');
      $('.library-portal').html(header + navbar + information + search + news + breadcrumb);

      $('.library-navigation').affix({
        offset: {
          top: 180,
          bottom: function() {
            return (this.bottom = $('.footer').outerHeight(true));
          }
        }
      });

    });

  };
  renderArticles(options = {}) {
    let markup;

    this.getData(options).success(function(data){

      if (options.template === 'article') {
        data.meta = options;
        markup = this.postSingleTemplate(data);
        let breadcrumb = this.breadcrumbTemplate(data);
        //$('.library-portal');
        $('.library-breadcrumb').html(breadcrumb);
        $('.library-portal').addClass('lo-auron-2-3').html(markup);
        scrollToElement('.library-portal');
      } else if (options.template === 'articles') {

        markup = this.postPostsTemplate(data);
        $('.library-portal').html(markup);
      } else {

        markup = this.postPostsTemplate(data);
        $('.library-news .outlet').html(markup);
        $('.article-entry').fadeIn();

      }

    });

  };

  renderPages(options = {}) {
    this.getData(options).success(function(data){

      let breadcrumb = this.breadcrumbTemplate(data),
          markup = this.pageShowTemplate(data);
      $('.library-portal').addClass('lo-auron-2-3');
      $('.breadcrumb-view').html(breadcrumb);
      $('.library-portal').html(markup);
      scrollToElement('.library-portal');
    });
  };
  renderBox(options = {}){
    this.getData(options).success(function(data){
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
    Handlebars.registerHelper('each_upto', function(ary, max, options) {
      if (!ary || ary.length === 0)
      return options.inverse(this);

      var result = [];
      for (var i = 0; i < max && i < ary.length; ++i)
      result.push(options.fn(ary[i]));
      return result.join('');
    });
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
    Path.map("#/biblioteket/aktuelt/:pagetitle/:pageid").to(function() {
      //debug('/article page entered..');
      var opt = {};
      opt.template = 'article';
      opt.pageId = this.params.pageid;
      opt.articleLoClass = 'lo-auron-2-3';
      opt.articleDestinationAddressInternal = '#/biblioteket/aktuelt';
      opt.url = 'http://hiof.no/api/v1/articles/';
      //loadData(opt);
      library.renderArticles(opt);
    });
    Path.map("#/biblioteket/side/:pagetitle/:pageid").enter(function() {
      //Reset checkboxes
      //resetFilter();
    }).to(function() {
      var opt = {};
      opt.template = 'page';
      opt.id = this.params.pageid;
      opt.url = 'http://hiof.no/api/v1/page/';
      //loadData(opt);
      library.renderPages(opt);
    });

    Path.map("#/biblioteket/aktuelt").to(function() {

      //debug('Articles get loaded...');
      let opt = {};
      opt.template = 'articles';
      opt.url = 'http://hiof.no/api/v1/articles/';
      opt.articleDestinationAddressInternal = '#/biblioteket/aktuelt';
      opt.category = '20';
      opt.articleLoClass = 'lo-half';
      opt.pageSize = '40';
      //loadData(opt);
      //loadData();

      library.renderArticles(opt);

    });
    Path.map("#/biblioteket").to(function() {
      //loadData();
      library.renderIndex();

      setTimeout(function(){
        var opt = {};
        opt.url = 'http://hiof.no/api/v1/box/';
        opt.server = "www2";
        opt.id = "1036";
        //loadData(opt);
        library.renderBox(opt);
      }, 500);



      setTimeout(function(){
        var opt = {};
        opt.template = 'article-index';
        opt.url = 'http://hiof.no/api/v1/articles/';
        opt.category = '20';
        opt.articleLoClass = 'lo-quarter';
        opt.articleDestinationAddressInternal = '#/biblioteket/aktuelt';
        opt.pageSize = '4';
        //loadData(opt);
        library.renderArticles(opt);
      }, 1500);

    });
    Path.map("#/biblioteket/").to(function() {
      library.renderIndex();
      setTimeout(function(){
        var opt = {};
        opt.url = 'http://hiof.no/api/v1/box/';
        opt.server = "www2";
        opt.id = "1036";
        //loadData(opt);
        library.renderBox(opt);
      }, 500);
      setTimeout(function(){
        var opt = {};
        opt.template = 'article-index';
        opt.url = 'http://hiof.no/api/v1/articles/';
        opt.category = '20';
        opt.articleLoClass = 'lo-quarter';
        opt.articleDestinationAddressInternal = '#/biblioteket/aktuelt';
        opt.pageSize = '4';
        //loadData(opt);
        library.renderArticles(opt);
      }, 1500);

    });

    initatePathLibrary = function() {
      // Load root path if no path is active
      Path.root("#/biblioteket");
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
    $(document).on('click', '.navbar-toggle', function(e) {
      $('#library-navbar-collapse').slideToggle();
    });

    $(document).on('click', '.library-search-advanced-toggle', function(e) {
      e.preventDefault();
      $(this).toggleClass('btn-default').toggleClass('btn-primary');
      $('.library-search-simple').toggleClass('input-group').toggleClass('form-group');
      $('.form-horizontal  .control-label').toggleClass('sr-only');
      $('.library-search-simple-button').toggle();
      $('.library-search-advanced').toggleClass('visuallyhidden');

    });
    //http://bibsys-almaprimo.hosted.exlibrisgroup.com/primo_library/libweb/action/search.do?fn=search&ct=search&initialSearch=true&mode=Basic&tab=default_tab&indx=1&dum=true&srt=rank&vid=HIO&frbg=&tb=t&vl%28freeText0%29=test&scp.scps=scope%3A%28SC_OPEN_ACCESS%29%2Cscope%3A%28%22HIO%22%29%2Cprimo_central_multiple_fe
    //http://bibsys-almaprimo.hosted.exlibrisgroup.com/primo_library/libweb/action/dlSearch.do?vid=HIO&institution=HIO&institution=HIO&search_scope=default_scope&lang=nor&afterPDS=true&check=checked&query=any,contains,
    $(document).on('submit', '.form-horizontal', function(e){
        //e.preventDefault();
        let data = $('.form-horizontal input').serialize();

        console.log(data);
    });


  });

})(window.Hiof = window.Hiof || {});
