class LibraryView {
  constructor() {
    this.view = new View();
    this.accordionView = new AccordionView();
    this.breadcrumbTemplate = Hiof.Templates['library/breadcrumb'];
    this.informationTemplate = Hiof.Templates['library/information'];
    this.newsTemplate = Hiof.Templates['library/news'];
    this.postSingleTemplate = Hiof.Templates['articles/post-single'];
    this.postPostsTemplate = Hiof.Templates['articles/posts'];
    this.pageShowTemplate = Hiof.Templates['page/show'];
    this.boxTemplate = Hiof.Templates['library/box'];

    this.pageFooterTemplate = Hiof.Templates['footer/pageFooter'];
    this.defaults = {
      // These are the defaults.
      id: null,
      layered: true,
      visible: true,
      server: 'www2',
      url: '//www.hiof.no/api/v2/libraryservices/',
      template: null,
      lang: this.view.ln,
    };
    this.pageFooterData = {"data":[
      {
        "id": 0,
        "type": "link",
        "attributes":{
          "name":"Kontakt biblioteket",
          "url": "http://www2.hiof.no/index.php?&ID=24859"
        }
      },{
        "id": 1,
        "type": "link",
        "attributes":{
          "name":"Lån en bibliotekar",
          "url": "https://www.survey-xact.no/LinkCollector?key=C9U3RTMR1515"
        }
      },{
        "id": 2,
        "type": "link",
        "attributes":{
          "name":"Åpningstider for biblioteket",
          "url": "http://www2.hiof.no/index.php?&ID=24877"
        }
      }
    ]};
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
    //this.view.i18n.success(function(data){
    //  this.i18n = data;
    //});
    let indexRender = $.Event("indexrender");
    let that = this;
    this.view.getData(settings, that).success(function(data){
      data.settings = settings;
      //console.log(data);
      // Populate templates with data
      let breadcrumb = that.breadcrumbTemplate(data),
      footer = that.pageFooterTemplate(that.pageFooterData);
      //console.log(header + navbar + content + footer + breadcrumb);
      $('#nav').addClass('nav navbar-nav');
      $('#nav .parent').attr('data-toggle', 'dropdown').append('<span class="caret"></span>');
      $('#nav .daddy').append('<span class="caret"></span>');
      $('#nav ul').addClass('dropdown-menu');
      $('.library-portal .library-content').html(footer);
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
    let data = {};

    let settings = Object.assign(
      {},
      this.defaults
    );
    data.settings = settings;
    let articleRender = $.Event("articlerender");
    let boxRender = $.Event("boxrender");
    let information = this.informationTemplate(),
    news = this.newsTemplate(data);
    $('.library-portal .library-content').prepend(information + news);
    $(window).trigger(articleRender);
    $(window).trigger(boxRender);
    //Hiof.reloadAccordion();
    this.accordionView.renderAccordion();
    $('.library-portal').removeClass('loader').addClass('loaded');
  };
  renderArticles(options = {}) {
    let markup;
    let that = this;
    //console.log(options);
    //this.renderLibrary(options);
    this.view.getData(options, that).success(function(data){

      if (options.template === 'article') {
        data.meta = options;
        data.meta.title = data.posts[0].articleTitle;
        markup = that.postSingleTemplate(data);
        //let breadcrumb = that.breadcrumbTemplate(data);
        //$('#library-breadcrumb').html(breadcrumb);
        $('#nav').addClass('nav navbar-nav');
        $('#nav .parent').attr('data-toggle', 'dropdown').append('<span class="caret"></span>');
        $('#nav .daddy').append('<span class="caret"></span>');
        $('#nav ul').addClass('dropdown-menu');
        //console.log('single article is supposed to be added to the page...');
        //$('.library-content-page > article > h1').remove();
        $('.library-content-page').html(markup);
        $('.library-portal').removeClass('loader').addClass('loaded');
        //that.view.scrollToElement('.library-portal');
      } else if (options.template === 'articles') {
        markup = that.postPostsTemplate(data);
        $('.library-content-page .outlet').html(markup);
      } else {
        //console.log('data from renderArticles else (index?)');
        data.meta = options;

        //console.log(data);
        if ($('.library-news').length) {

          $(data.posts).each(function(){
            this.articleDestinationAddressInternal = '/nor/biblioteket/om-biblioteket/aktuelt';
          });
          markup = that.postPostsTemplate(data);
          $('.library-news .outlet').html(markup);
        }else{
          $(data.posts).each(function(){
            this.articleLoClass = 'lo-half';
          });
          markup = that.postPostsTemplate(data);
          $('.library-content-page .outlet').html(markup);
        }
      }

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

    // Update google analytics on page-navigation
    updateAnalytics(){
      // Send page update to hiof.no analytics
      //   ga('set', 'page', document.location.href);
      //   ga('send', 'pageview');
      //   // Send page update to library analytics
      //   ga('library.set', 'page', document.location.href);
      //   ga('library.send', 'pageview');
    };
  }


  (function(Hiof, undefined) {
    // On page load
    $(function(){
      let library = new LibraryView(),
          view = new View();

      Hiof.libraryView = library;

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

      Path.map("#/").enter(function() {
        library.updateAnalytics();
      }).to(function() {
        library.renderLibrary();
      });



      Path.map("#/portal").enter(function() {
        library.updateAnalytics();
      }).to(function() {
        library.renderLibrary();
      });
      Path.map("#/portal/").enter(function() {
        library.updateAnalytics();
      }).to(function() {
        library.renderLibrary();
      });


      Path.map("#/:articletitle/a/:articleid").enter(function() {
        library.updateAnalytics();
      }).to(function() {
        var opt = {};
        opt.template = 'article';
        opt.pageId = this.params.articleid;
        opt.articleLoClass = 'lo-auron-2-3';
        //opt.articleDestinationAddressInternal = '#/biblioteket/aktuelt';
        opt.url = '//www.hiof.no/api/v1/articles/';
        //loadData(opt);
        library.renderArticles(opt);
      });


      Path.map("#/aktuelt").to(function() {
        let opt = {};
        opt.template = 'articles';
        opt.url = '//www.hiof.no/api/v1/articles/';
        opt.category = '20';
        opt.articleLoClass = 'lo-quarter';
        opt.pageSize = '40';
        library.renderLibrary(opt);

      });
      Path.map("#/").enter(function() {
        library.updateAnalytics();
      }).to(function(){
        library.renderLibrary();
      });

      initatePathLibrary = function() {
        // Load root path if no path is active
        Path.root("#/");
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
        let button = $(this),
            url = $(button).attr('href');

        if (url.substring(0, 2) == "#/") {
          //debug('String starts with #/');
        } else if (url.substring(0, 1) == "#") {
          if ($(button).attr('role') == 'tab') {
            e.preventDefault();
          }else{
            hash = url + "";
            e.preventDefault();
            setTimeout(function() {
              view.scrollToElement(hash);
            }, 200);
          }

        }
      });

      $(window).on('indexrender', function (e) {
        library.renderIndex();
      });

      $(window).on('articlerender', function (e) {
        let opt = {};
        opt.template = 'article-index';
        opt.url = '//www.hiof.no/api/v1/articles/';
        opt.category = '20';
        opt.articleLoClass = 'lo-quarter';
        opt.pageSize = '4';


        library.renderArticles(opt);
      });


      $(window).on('pagerender', function (e) {
        library.renderPages();
      });


      $(window).on('boxrender', function (e) {

        var opt = {};
        opt.url = '//www.hiof.no/api/v1/box/';
        opt.server = "www2";
        if ($('html').attr('lang') == 'en') {
          opt.id = "1039";
        }else{
          opt.id = "1036";
        }

        library.renderBox(opt);

      });

    });

  })(window.Hiof = window.Hiof || {});
