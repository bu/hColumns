build:
	make clean
	make jshint
	make minify

jshint:
	jshint js/jquery.hcolumns.js

minify:
	uglifyjs js/jquery.hcolumns.js -o js/jquery.hcolumns.min.js

clean:
	rm -f js/jquery.hcolumns.min.js
