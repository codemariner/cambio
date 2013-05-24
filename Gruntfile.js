/*global module:false*/
module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            server: {
                options: {
                    port: 3000,
                    base: './',
                    middleware: function (connect, options) {
                        return [
                            // Serve static files.
                            connect.static(options.base, {maxAge: 1}),
                            // Make empty directories browsable.
                            connect.directory(options.base)
                        ];
                    }

                }
            }
        },
        meta: {
            banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
        },
        qunit: {
            files: ['test/**/*.html']
        },
        concat: {
            dist: {
                src: [ 
                    'vendor/nivo/jquery.nivo.slider.js',
                    'src/cambio.main.js',
                    'src/cambio.mm.js',
                    'src/cambio.monitor.js',
                    'src/cambio.knot.js'
                ],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                report: false
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['dist/<%= pkg.name %>.js']
                }
            }
        },
        watch: {
            files: ['src/*.js', 'vendor/nivo/jquery.nivo.slider.js'],
            tasks: ['jshint', 'concat', 'uglify', 'connect:server']
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                browser: true,
                white: true,
                globals: {
                    console: true,
                    JSON: true,
                    jQuery: true,
                    escape: true,
                    unescape: true
                }
            },
            dist: ['src/cambio.*.js'],
            grunt: ['GruntFile.js']
        }
    });

    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'connect:server', 'watch']);
    grunt.registerTask('build', ['jshint', 'concat', 'uglify']);

    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
};
