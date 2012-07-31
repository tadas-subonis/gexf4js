gexf4js
=======

GEXF format parser in JavaScript to return native, easy-to-use JavaScript types from XML

Usage:
```
var resultGexf = Sys.gexfParser("/server/location.gexf");
or 
var gexfhttp = new XMLHttpRequest();
        gexfhttp.overrideMimeType('text/xml');
        gexfhttp.open('GET', location, false);
        gexfhttp.send();
		
var resultGexf = Sys.gexfParser(gexfhttp.responseXML);
```

returns:
```
 -> edges
    [0]
	  -> label (String)
	  -> attributes
	     [0]
		   name(String) : value (String)
		 [..]
	  -> source (Node object)
	  -> target (Node object)
	[..]
 -> nodes
    [0]
	  -> linksIn
	    [0] (Edge object)
		[..]
	  -> linksOut
	    [0] (Edge object)
		[..]
	  -> attributes
	     [0]
		   name(String) : value (String)
		 [..]
      -> label (String)
	  -> children
	    [0] (Node object)
		[..]
	[..]
```