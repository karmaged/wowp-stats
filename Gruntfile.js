'use strict';

module.exports = function(grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'public/js/{,*/}*.js',
        '!public/js/vendor/*'
      ]
    },
    express: {
      options: {
        port: 1337
      },
      dev: {
        options: {
          script: 'app.js'
        }
      }
    },
    concurrent: {
        server: {
          tasks: ['express:dev', 'watch'],
          options: {
            logConcurrentOutput: true
          }
        }
    },
    connect: {
      test: {
        options: {
          port: 1337,
          base: 'test'
        }
      }
    },
    watch: {
      express: {
        files: [
          'app.js',
          'modules/{,*/}*.js',
          'public/js/**/{,*/}*.js'
        ],
        tasks: ['express:dev'],
        options: {
          nospawn: true
        }
      },
      livereload: {
        files: [
          'public/*.html',
          'public/js/templates/*.html',
          'public/css/*.css',
          'public/js/{,*/}*.js',
          'public/img/{,*/}*.{png,jpg,jpeg,gif,webp}'
        ],
        options: {
          livereload: true
        }
      },
      compass: {
        files: ['public/sass/{,*/}*.{scss,sass}'],
        tasks: ['compass:dev']
      }
    },
    compass: {
      options: {
        sassDir: 'public/sass',
        cssDir: 'public/css',
        imagesDir: 'public/img',
        javascriptsDir: 'public/js',
        fontsDir: 'public/fonts',
        importPath: 'public',
        relativeAssets: true
      },
      dev: {
        options: {
          debugInfo: true,
          environment: 'development'
        }
      },
      dist: {
        options: {
          environment: 'production'
        }
      }
    },
    clean: {
      dev: ['public/css'],
      dist: ['public/css', 'dist/*']
    },
    requirejs: {
      dist: {
        options: {
          baseUrl: 'public/js',
          optimize: 'none',
          paths: {
            'templates': 'templates',
            'swiffy': 'empty:'
          },
          preserveLicenseComments: false,
          useStrict: true,
          wrap: true
        }
      }
    },
    useminPrepare: {
      html: 'public/index.html',
      options: {
        dest: 'dist/static'
      }
    },
    usemin: {
      html: ['dist/{,*/}*.html'],
      css: ['dist/css/{,*/}*.css'],
      options: {
        dirs: ['dist/static']
      }
    },
    cssmin: {
      dist: {
        files: {
          'dist/static/css/main.css': ['public/css/main.css']
        }
      }
    },
    htmlmin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'public',
          src: '*.html',
          dest: 'dist/views/'
        }]
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'public/img',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: 'dist/static/img'
        }]
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: 'public',
          src: [
            '*.{ico,txt}',
            'img/{,*/}*.{webp,gif}'
          ],
          dest: 'dist/static'
        },
        {
          expand: true,
          src: ['app.js', 'package.json', 'nginx.conf', 'settings.js'],
          dest: 'dist'
        },
        {
          expand: true,
          cwd: 'modules',
          src: ['*.js'],
          dest: 'dist/modules'
        },
        {
          expand: true,
          cwd: 'public/js',
          src: ['swiffy.js'],
          dest: 'dist/static/js'
        }]
      }
    },
    mocha: {
      all: {
        options: {
          run: true,
          urls: ['http://localhost:<%= connect.test.options.port %>/index.html']
        }
      }
    }
  });

  grunt.registerTask('build', [
    'clean:dist',
    'compass:dist',
    'useminPrepare',
    'requirejs',
    'imagemin',
    'htmlmin',
    'concat',
    'cssmin',
    'uglify',
    'copy',
    'usemin'
  ]);

  grunt.registerTask('server', [
    'clean:dev',
    'compass:dev',
    'concurrent:server'
  ]);

  grunt.registerTask('test', [
    'connect:test',
    'mocha'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'build'
  ]);

};
