class LibraryView {
  constructor() {
    this.headerTemplate = Hiof.Templates['library/header'];
    this.breadcrumbTemplate = Hiof.Templates['library/breadcrumb'];
    this.navbarTemplate = Hiof.Templates['library/navbar'];
    this.navgridTemplate = Hiof.Templates['library/navgrid'];
    this.informationTemplate = Hiof.Templates['library/information'];
    this.searchTemplate = Hiof.Templates['library/search'];
    this.newsTemplate = Hiof.Templates['library/news'];
    this.postSingleTemplate = Hiof.Templates['articles/post-single'];
    this.postPostsTemplate = Hiof.Templates['articles/posts'];
    this.pageShowTemplate = Hiof.Templates['page/show'];

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
          //navgrid = this.navgridTemplate(data),
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

      //var breadcrumSource = Hiof.Templates['library/breadcrumb'];
      //var templateSource = Hiof.Templates['page/show'];

      let breadcrumb = this.breadcrumSource(data);
      let markup = this.pageShowTemplate(data);
      $('.library-portal').addClass('lo-auron-2-3');
      $('.breadcrumb-view').html(breadcrumb);
      $('.library-portal').html(markup);
      scrollToElement('.library-portal');
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
    Path.map("#/biblioteket/side/:pageid").enter(function() {
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
        opt.template = 'article-index';
        opt.url = 'http://hiof.no/api/v1/articles/';
        opt.category = '20';
        opt.articleLoClass = 'lo-quarter';
        opt.articleDestinationAddressInternal = '#/biblioteket/aktuelt';
        opt.pageSize = '4';
        //loadData(opt);
        library.renderArticles(opt);
      }, 2000);

    });
    Path.map("#/biblioteket/").to(function() {
      library.renderIndex();
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
      }, 2000);

    });



    initatePathItservices = function() {
      // Load root path if no path is active
      Path.root("#/biblioteket");
    };

    if (typeof Hiof.meta === 'undefined') {
      Hiof.meta = {};
    }
    if ($('.library-portal').length) {
      //getData();
      initatePathItservices();

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
  });




})(window.Hiof = window.Hiof || {});
