class LibraryView {
  constructor() {
    //super();
  }
  getData(options = {}){
    //let data = super.getData(options);
    var defaults = {
      // These are the defaults.
      id: null,
      server: 'www2',
      url: 'http://hiof.no/api/v2/libraryservices/',
      template: null
    };

    let settings = Object.assign(
      {},
      defaults,
      options
    );

    let contentType = "application/x-www-form-urlencoded; charset=utf-8";

    if (window.XDomainRequest) { //for IE8,IE9
      contentType = "text/plain";
    }

    return $.ajax({
      url: settings.url,
      method: 'GET',
      async: true,
      dataType: 'json',
      data: settings,
      contentType: contentType,
      success: function(data) {
        return data;
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert("You can not send Cross Domain AJAX requests: " + errorThrown);
      }

    });

  }
  renderIndex(options) {

    this.getData(options).success(function(data){


      let headerTemplate = Hiof.Templates['library/header'],
      breadcrumbTemplate = Hiof.Templates['library/breadcrumb'],
      navbarTemplate = Hiof.Templates['library/navbar'],
      navgridTemplate = Hiof.Templates['library/navgrid'],
      informationTemplate = Hiof.Templates['library/information'],
      searchTemplate = Hiof.Templates['library/search'],
      newsTemplate = Hiof.Templates['library/news'];

      // Populate templates with data
      let header = headerTemplate(data),
      breadcrumb = breadcrumbTemplate(data),
      navbar = navbarTemplate(data),
      navgrid = navgridTemplate(data),
      information = informationTemplate(data),
      search = searchTemplate(data),
      news = newsTemplate(data);

      //var index = templateSource(data);


      // <div id="bib-view-navbar"></div>
      // <div id="bib-view-grid"></div>

      $('.library-portal').removeClass('lo-auron-2-3');
      //$('.breadcrumb-view').html(breadcrumb);
      //if ($('#bib-view-navbar').length) {
      $('.library-portal').html(header + navbar + information + search + news + breadcrumb);
      //} else {
      //  $('.library-portal').html(header + information + search + navgrid + news + breadcrumb);
      //}



      $('.library-navigation').affix({
        offset: {
          top: 180,
          bottom: function() {
            return (this.bottom = $('.footer').outerHeight(true));
          }
        }
      });

      // Load articles

      //debug('Articles get loaded...');



    });



  };
  renderArticles(options) {
    let templateSource, markup;

    this.getData(options).success(function(data){

      if (options.template === 'article') {
        //debug('Article data:');
        data.meta = options;
        //debug(data);
        let breadcrumSource = Hiof.Templates['library/breadcrumb'];
        templateSource = Hiof.Templates['articles/post-single'];
        markup = templateSource(data);
        let breadcrumb = breadcrumSource(data);
        $('.library-portal').addClass('lo-auron-2-3');
        $('.breadcrumb-view').html(breadcrumb);
        $('.library-portal').html(markup);
        scrollToElement('.library-portal');
      } else if (options.template === 'articles') {

        //debug('/biblioteket/aktuelt loaded...');
        templateSource = Hiof.Templates['articles/posts'];
        markup = templateSource(data);
        $('.library-portal').html(markup);
      } else {


        templateSource = Hiof.Templates['articles/posts'];
        markup = templateSource(data);
        $('.library-news .outlet').html(markup);
        $('.article-entry').fadeIn();
        //$('.article-entry').animate({ opacity: 1 }, 700);​
        //scrollToElement('.library-portal');
        //$('.library-news').slideDown();
      }

    });
    //console.log('Data loaded for the article');
    //console.log(data);
    //debug('Article template loaded...');


  };

  renderPages(options) {
    this.getData(options).success(function(data){

      var breadcrumSource = Hiof.Templates['library/breadcrumb'];
      var templateSource = Hiof.Templates['page/show'];

      var breadcrumb = breadcrumSource(data);
      var markup = templateSource(data);
      $('.library-portal').addClass('lo-auron-2-3');
      $('.breadcrumb-view').html(breadcrumb);
      $('.library-portal').html(markup);
      scrollToElement('.library-portal');
    });
    //data.meta = data.settings;
    //debug(data);

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
      //console.log(result);
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
          scrollToElement(hash);
        }, 200);

      }
    });
    $(document).on('click', '.navbar-toggle', function(e) {
      //console.log('hello...');
      $('#library-navbar-collapse').slideToggle();
    });
  });




})(window.Hiof = window.Hiof || {});
