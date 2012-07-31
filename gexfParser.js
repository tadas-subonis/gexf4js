if (!Sys) {
    Sys = {
        debug : false
    };
}

Sys.gexfParser = function(location, isDom) {
    var load = isDom || false;
    if (load){
        var gexfhttp = new XMLHttpRequest() ;
        gexfhttp.overrideMimeType('text/xml');
        gexfhttp.open('GET', location, false);
        gexfhttp.send();
    
        var content = gexfhttp.responseXML;
        if (Sys.debug) {
            console.log("We got response:");
            console.log(content);
        }
    }
    else { 
        content = location;
        if (Sys.debug) {
            console.log("We were given: ");
            console.log(content);
        }
    }
    
    
    /*
 * The list of attributes of the nodes of the graph that we build in json
 */
    var nodesAttributes = {};   
    
    /*
 * The list of attributes of the edges of the graph that we build in json
 */
    var edgesAttributes = {};   
    
    /*
 * In the gexf (that is an xml), the list of xml nodes 'attributes' (note the plural 's')
 */
    var attributesNodes = content.getElementsByTagName('attributes'); 
  
    for (var i = 0; i < attributesNodes.length; i++) {
        
        /*
     * attributesNode is each xml node 'attributes' (plural)
     */
        var attributesNode = attributesNodes[i];
        if (attributesNode.getAttribute('class') == 'node') {
            
            /*
         * The list of xml nodes 'attribute' (no 's')
         */
            var attributeNodes = attributesNode.getElementsByTagName('attribute');
            
            
            for (var j = 0; j < attributeNodes.length; j++) {    
                /*
             * Each xml node 'attribute'
             */
                var attributeNode = attributeNodes[j];
        
                var id = attributeNode.getAttribute('id');
                var title = attributeNode.getAttribute('title');
                var type = attributeNode.getAttribute('type');
        
                var attribute = {
                    id: id, 
                    title: title, 
                    type: type
                };
                
                nodesAttributes[id] = (attribute);
            }
        } 
        else if (attributesNode.getAttribute('class') == 'edge') {
            
            attributeNodes = attributesNode.getElementsByTagName('attribute');  // The list of xml nodes 'attribute' (no 's')
            
            for( j = 0; j<attributeNodes.length; j++){
                attributeNode = attributeNodes[j];  // Each xml node 'attribute'
        
                id = attributeNode.getAttribute('id'),
                title = attributeNode.getAttribute('title'),
                type = attributeNode.getAttribute('type');
          
                attribute = {
                    id:id, 
                    title:title, 
                    type:type
                };
                edgesAttributes[id] = (attribute);
        
            }
        }
    }
    
    /*
 * End node information loading
 */
    
    if (Sys.debug) {
        console.log("Attribute information:");
        console.log(nodesAttributes);
        console.log(edgesAttributes);
    }
    
    /*
 * The nodes of the graph
 */
    var nodes = [];
    var nodeMap = {};
    
    /*
 * The list of xml nodes 'nodes' (plural)
 */
    var nodesNodes = content.getElementsByTagName('nodes');
  
    for(i = 0; i < nodesNodes.length; i++){
        
        /*
     * Each xml node 'nodes' (plural)
     */
        var nodesNode = nodesNodes[i];
        
        /*
     * The list of xml nodes 'node' (no 's')
     */
        var nodeNodes = nodesNode.getElementsByTagName('node'); 

        /*
     *  Each xml node 'node' (no 's')
     */
        for (j = 0; j < nodeNodes.length; j++) {
            var nodeNode = nodeNodes[j];

            id = nodeNode.getAttribute('id');
            var label = nodeNode.getAttribute('label') || id;
      
            
            // Create Node
            var node = {
                id : id,
                label : label, 
                attributes : {},
                children : [],
                linksOut : [],
                linksIn : []
            };  // The graph node
      
            // Attribute values
            var attvalueNodes = nodeNode.getElementsByTagName('attvalue');
            var attributesForNodes = {};
            
            for (var k = 0; k < attvalueNodes.length; k++){
                var attvalueNode = attvalueNodes[k];
                var attr = attvalueNode.getAttribute('for');
                var val = attvalueNode.getAttribute('value');
                var attributeTitle = nodesAttributes[attr].title;
                
                attributesForNodes[attributeTitle] = val;
            }
            node.attributes = attributesForNodes;
            nodes.push(node);
            nodeMap[node.id] = node;
        }
    }
    
    if (Sys.debug) {
        console.log("Found nodes:");
        console.log(nodes);
    }
    
    
    /*
 * Edges
 */
    
    var edges = [];
    var edgesNodes = content.getElementsByTagName('edges');
    
    var nodeFinder = function(nodeId) {
        return nodeMap[nodeId];
    }
    
    for (i = 0; i < edgesNodes.length; i++) {
        var edgesNode = edgesNodes[i];
        var edgeNodes = edgesNode.getElementsByTagName('edge');
        for (j = 0; j < edgeNodes.length; j++) {
            var edgeNode = edgeNodes[j];
            var source = edgeNode.getAttribute('source');
            var target = edgeNode.getAttribute('target');
            
            var sourceObject = nodeFinder(source);
            var targetObject = nodeFinder(target);
            
            
            sourceObject.children.push(targetObject);
            
            label = edgeNode.getAttribute('label');
            
            id = edgeNode.getAttribute('id');
            var edge = {
                id:         id,
                source:   sourceObject,
                target:   targetObject,
                label:      label,
                attributes: {}
            };

            var weight = edgeNode.getAttribute('weight');
            if (weight != undefined) {
                edge['weight'] = weight;
            }

            attvalueNodes = edgeNode.getElementsByTagName('attvalue');
            for (k = 0; k < attvalueNodes.length; k++){
                attvalueNode = attvalueNodes[k];
                attr = attvalueNode.getAttribute('for');
                val = attvalueNode.getAttribute('value');
                attributeTitle = edgesAttributes[attr].title;
                edge.attributes[attributeTitle] = val;
            }
            
            edges.push(edge);
            
            sourceObject.linksOut.push(edge);
            targetObject.linksIn.push(edge);
        }
    }
    
    if (Sys.debug) {
        console.log("Edges:");
        console.log(edges);
    }
    
    var retVal = {
        nodes: nodes, 
        edges: edges
    };
    
    if (Sys.debug) {
        console.log("Returning:");
        console.log(retVal);
    }
    
    return retVal;
}