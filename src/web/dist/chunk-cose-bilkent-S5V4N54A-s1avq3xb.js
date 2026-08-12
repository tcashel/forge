import {
  cytoscape as cytoscape2
} from "./chunk-main-4z6az973.js";
import {
  __name,
  log,
  select_default
} from "./chunk-main-vcnyggwp.js";
import {
  __commonJS,
  __toESM
} from "./chunk-main-g8wf8be2.js";

// node_modules/layout-base/layout-base.js
var require_layout_base = __commonJS((exports, module) => {
  (function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === "object" && typeof module === "object")
      module.exports = factory();
    else if (typeof define === "function" && define.amd)
      define([], factory);
    else if (typeof exports === "object")
      exports["layoutBase"] = factory();
    else
      root["layoutBase"] = factory();
  })(exports, function() {
    return function(modules) {
      var installedModules = {};
      function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) {
          return installedModules[moduleId].exports;
        }
        var module2 = installedModules[moduleId] = {
          i: moduleId,
          l: false,
          exports: {}
        };
        modules[moduleId].call(module2.exports, module2, module2.exports, __webpack_require__);
        module2.l = true;
        return module2.exports;
      }
      __webpack_require__.m = modules;
      __webpack_require__.c = installedModules;
      __webpack_require__.i = function(value) {
        return value;
      };
      __webpack_require__.d = function(exports2, name, getter) {
        if (!__webpack_require__.o(exports2, name)) {
          Object.defineProperty(exports2, name, {
            configurable: false,
            enumerable: true,
            get: getter
          });
        }
      };
      __webpack_require__.n = function(module2) {
        var getter = module2 && module2.__esModule ? function getDefault() {
          return module2["default"];
        } : function getModuleExports() {
          return module2;
        };
        __webpack_require__.d(getter, "a", getter);
        return getter;
      };
      __webpack_require__.o = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
      };
      __webpack_require__.p = "";
      return __webpack_require__(__webpack_require__.s = 26);
    }([
      function(module2, exports2, __webpack_require__) {
        function LayoutConstants() {}
        LayoutConstants.QUALITY = 1;
        LayoutConstants.DEFAULT_CREATE_BENDS_AS_NEEDED = false;
        LayoutConstants.DEFAULT_INCREMENTAL = false;
        LayoutConstants.DEFAULT_ANIMATION_ON_LAYOUT = true;
        LayoutConstants.DEFAULT_ANIMATION_DURING_LAYOUT = false;
        LayoutConstants.DEFAULT_ANIMATION_PERIOD = 50;
        LayoutConstants.DEFAULT_UNIFORM_LEAF_NODE_SIZES = false;
        LayoutConstants.DEFAULT_GRAPH_MARGIN = 15;
        LayoutConstants.NODE_DIMENSIONS_INCLUDE_LABELS = false;
        LayoutConstants.SIMPLE_NODE_SIZE = 40;
        LayoutConstants.SIMPLE_NODE_HALF_SIZE = LayoutConstants.SIMPLE_NODE_SIZE / 2;
        LayoutConstants.EMPTY_COMPOUND_NODE_SIZE = 40;
        LayoutConstants.MIN_EDGE_LENGTH = 1;
        LayoutConstants.WORLD_BOUNDARY = 1e6;
        LayoutConstants.INITIAL_WORLD_BOUNDARY = LayoutConstants.WORLD_BOUNDARY / 1000;
        LayoutConstants.WORLD_CENTER_X = 1200;
        LayoutConstants.WORLD_CENTER_Y = 900;
        module2.exports = LayoutConstants;
      },
      function(module2, exports2, __webpack_require__) {
        var LGraphObject = __webpack_require__(2);
        var IGeometry = __webpack_require__(8);
        var IMath = __webpack_require__(9);
        function LEdge(source, target, vEdge) {
          LGraphObject.call(this, vEdge);
          this.isOverlapingSourceAndTarget = false;
          this.vGraphObject = vEdge;
          this.bendpoints = [];
          this.source = source;
          this.target = target;
        }
        LEdge.prototype = Object.create(LGraphObject.prototype);
        for (var prop in LGraphObject) {
          LEdge[prop] = LGraphObject[prop];
        }
        LEdge.prototype.getSource = function() {
          return this.source;
        };
        LEdge.prototype.getTarget = function() {
          return this.target;
        };
        LEdge.prototype.isInterGraph = function() {
          return this.isInterGraph;
        };
        LEdge.prototype.getLength = function() {
          return this.length;
        };
        LEdge.prototype.isOverlapingSourceAndTarget = function() {
          return this.isOverlapingSourceAndTarget;
        };
        LEdge.prototype.getBendpoints = function() {
          return this.bendpoints;
        };
        LEdge.prototype.getLca = function() {
          return this.lca;
        };
        LEdge.prototype.getSourceInLca = function() {
          return this.sourceInLca;
        };
        LEdge.prototype.getTargetInLca = function() {
          return this.targetInLca;
        };
        LEdge.prototype.getOtherEnd = function(node) {
          if (this.source === node) {
            return this.target;
          } else if (this.target === node) {
            return this.source;
          } else {
            throw "Node is not incident with this edge";
          }
        };
        LEdge.prototype.getOtherEndInGraph = function(node, graph) {
          var otherEnd = this.getOtherEnd(node);
          var root = graph.getGraphManager().getRoot();
          while (true) {
            if (otherEnd.getOwner() == graph) {
              return otherEnd;
            }
            if (otherEnd.getOwner() == root) {
              break;
            }
            otherEnd = otherEnd.getOwner().getParent();
          }
          return null;
        };
        LEdge.prototype.updateLength = function() {
          var clipPointCoordinates = new Array(4);
          this.isOverlapingSourceAndTarget = IGeometry.getIntersection(this.target.getRect(), this.source.getRect(), clipPointCoordinates);
          if (!this.isOverlapingSourceAndTarget) {
            this.lengthX = clipPointCoordinates[0] - clipPointCoordinates[2];
            this.lengthY = clipPointCoordinates[1] - clipPointCoordinates[3];
            if (Math.abs(this.lengthX) < 1) {
              this.lengthX = IMath.sign(this.lengthX);
            }
            if (Math.abs(this.lengthY) < 1) {
              this.lengthY = IMath.sign(this.lengthY);
            }
            this.length = Math.sqrt(this.lengthX * this.lengthX + this.lengthY * this.lengthY);
          }
        };
        LEdge.prototype.updateLengthSimple = function() {
          this.lengthX = this.target.getCenterX() - this.source.getCenterX();
          this.lengthY = this.target.getCenterY() - this.source.getCenterY();
          if (Math.abs(this.lengthX) < 1) {
            this.lengthX = IMath.sign(this.lengthX);
          }
          if (Math.abs(this.lengthY) < 1) {
            this.lengthY = IMath.sign(this.lengthY);
          }
          this.length = Math.sqrt(this.lengthX * this.lengthX + this.lengthY * this.lengthY);
        };
        module2.exports = LEdge;
      },
      function(module2, exports2, __webpack_require__) {
        function LGraphObject(vGraphObject) {
          this.vGraphObject = vGraphObject;
        }
        module2.exports = LGraphObject;
      },
      function(module2, exports2, __webpack_require__) {
        var LGraphObject = __webpack_require__(2);
        var Integer = __webpack_require__(10);
        var RectangleD = __webpack_require__(13);
        var LayoutConstants = __webpack_require__(0);
        var RandomSeed = __webpack_require__(16);
        var PointD = __webpack_require__(4);
        function LNode(gm, loc, size, vNode) {
          if (size == null && vNode == null) {
            vNode = loc;
          }
          LGraphObject.call(this, vNode);
          if (gm.graphManager != null)
            gm = gm.graphManager;
          this.estimatedSize = Integer.MIN_VALUE;
          this.inclusionTreeDepth = Integer.MAX_VALUE;
          this.vGraphObject = vNode;
          this.edges = [];
          this.graphManager = gm;
          if (size != null && loc != null)
            this.rect = new RectangleD(loc.x, loc.y, size.width, size.height);
          else
            this.rect = new RectangleD;
        }
        LNode.prototype = Object.create(LGraphObject.prototype);
        for (var prop in LGraphObject) {
          LNode[prop] = LGraphObject[prop];
        }
        LNode.prototype.getEdges = function() {
          return this.edges;
        };
        LNode.prototype.getChild = function() {
          return this.child;
        };
        LNode.prototype.getOwner = function() {
          return this.owner;
        };
        LNode.prototype.getWidth = function() {
          return this.rect.width;
        };
        LNode.prototype.setWidth = function(width) {
          this.rect.width = width;
        };
        LNode.prototype.getHeight = function() {
          return this.rect.height;
        };
        LNode.prototype.setHeight = function(height) {
          this.rect.height = height;
        };
        LNode.prototype.getCenterX = function() {
          return this.rect.x + this.rect.width / 2;
        };
        LNode.prototype.getCenterY = function() {
          return this.rect.y + this.rect.height / 2;
        };
        LNode.prototype.getCenter = function() {
          return new PointD(this.rect.x + this.rect.width / 2, this.rect.y + this.rect.height / 2);
        };
        LNode.prototype.getLocation = function() {
          return new PointD(this.rect.x, this.rect.y);
        };
        LNode.prototype.getRect = function() {
          return this.rect;
        };
        LNode.prototype.getDiagonal = function() {
          return Math.sqrt(this.rect.width * this.rect.width + this.rect.height * this.rect.height);
        };
        LNode.prototype.getHalfTheDiagonal = function() {
          return Math.sqrt(this.rect.height * this.rect.height + this.rect.width * this.rect.width) / 2;
        };
        LNode.prototype.setRect = function(upperLeft, dimension) {
          this.rect.x = upperLeft.x;
          this.rect.y = upperLeft.y;
          this.rect.width = dimension.width;
          this.rect.height = dimension.height;
        };
        LNode.prototype.setCenter = function(cx, cy) {
          this.rect.x = cx - this.rect.width / 2;
          this.rect.y = cy - this.rect.height / 2;
        };
        LNode.prototype.setLocation = function(x, y) {
          this.rect.x = x;
          this.rect.y = y;
        };
        LNode.prototype.moveBy = function(dx, dy) {
          this.rect.x += dx;
          this.rect.y += dy;
        };
        LNode.prototype.getEdgeListToNode = function(to) {
          var edgeList = [];
          var edge;
          var self = this;
          self.edges.forEach(function(edge2) {
            if (edge2.target == to) {
              if (edge2.source != self)
                throw "Incorrect edge source!";
              edgeList.push(edge2);
            }
          });
          return edgeList;
        };
        LNode.prototype.getEdgesBetween = function(other) {
          var edgeList = [];
          var edge;
          var self = this;
          self.edges.forEach(function(edge2) {
            if (!(edge2.source == self || edge2.target == self))
              throw "Incorrect edge source and/or target";
            if (edge2.target == other || edge2.source == other) {
              edgeList.push(edge2);
            }
          });
          return edgeList;
        };
        LNode.prototype.getNeighborsList = function() {
          var neighbors = new Set;
          var self = this;
          self.edges.forEach(function(edge) {
            if (edge.source == self) {
              neighbors.add(edge.target);
            } else {
              if (edge.target != self) {
                throw "Incorrect incidency!";
              }
              neighbors.add(edge.source);
            }
          });
          return neighbors;
        };
        LNode.prototype.withChildren = function() {
          var withNeighborsList = new Set;
          var childNode;
          var children;
          withNeighborsList.add(this);
          if (this.child != null) {
            var nodes = this.child.getNodes();
            for (var i = 0;i < nodes.length; i++) {
              childNode = nodes[i];
              children = childNode.withChildren();
              children.forEach(function(node) {
                withNeighborsList.add(node);
              });
            }
          }
          return withNeighborsList;
        };
        LNode.prototype.getNoOfChildren = function() {
          var noOfChildren = 0;
          var childNode;
          if (this.child == null) {
            noOfChildren = 1;
          } else {
            var nodes = this.child.getNodes();
            for (var i = 0;i < nodes.length; i++) {
              childNode = nodes[i];
              noOfChildren += childNode.getNoOfChildren();
            }
          }
          if (noOfChildren == 0) {
            noOfChildren = 1;
          }
          return noOfChildren;
        };
        LNode.prototype.getEstimatedSize = function() {
          if (this.estimatedSize == Integer.MIN_VALUE) {
            throw "assert failed";
          }
          return this.estimatedSize;
        };
        LNode.prototype.calcEstimatedSize = function() {
          if (this.child == null) {
            return this.estimatedSize = (this.rect.width + this.rect.height) / 2;
          } else {
            this.estimatedSize = this.child.calcEstimatedSize();
            this.rect.width = this.estimatedSize;
            this.rect.height = this.estimatedSize;
            return this.estimatedSize;
          }
        };
        LNode.prototype.scatter = function() {
          var randomCenterX;
          var randomCenterY;
          var minX = -LayoutConstants.INITIAL_WORLD_BOUNDARY;
          var maxX = LayoutConstants.INITIAL_WORLD_BOUNDARY;
          randomCenterX = LayoutConstants.WORLD_CENTER_X + RandomSeed.nextDouble() * (maxX - minX) + minX;
          var minY = -LayoutConstants.INITIAL_WORLD_BOUNDARY;
          var maxY = LayoutConstants.INITIAL_WORLD_BOUNDARY;
          randomCenterY = LayoutConstants.WORLD_CENTER_Y + RandomSeed.nextDouble() * (maxY - minY) + minY;
          this.rect.x = randomCenterX;
          this.rect.y = randomCenterY;
        };
        LNode.prototype.updateBounds = function() {
          if (this.getChild() == null) {
            throw "assert failed";
          }
          if (this.getChild().getNodes().length != 0) {
            var childGraph = this.getChild();
            childGraph.updateBounds(true);
            this.rect.x = childGraph.getLeft();
            this.rect.y = childGraph.getTop();
            this.setWidth(childGraph.getRight() - childGraph.getLeft());
            this.setHeight(childGraph.getBottom() - childGraph.getTop());
            if (LayoutConstants.NODE_DIMENSIONS_INCLUDE_LABELS) {
              var width = childGraph.getRight() - childGraph.getLeft();
              var height = childGraph.getBottom() - childGraph.getTop();
              if (this.labelWidth > width) {
                this.rect.x -= (this.labelWidth - width) / 2;
                this.setWidth(this.labelWidth);
              }
              if (this.labelHeight > height) {
                if (this.labelPos == "center") {
                  this.rect.y -= (this.labelHeight - height) / 2;
                } else if (this.labelPos == "top") {
                  this.rect.y -= this.labelHeight - height;
                }
                this.setHeight(this.labelHeight);
              }
            }
          }
        };
        LNode.prototype.getInclusionTreeDepth = function() {
          if (this.inclusionTreeDepth == Integer.MAX_VALUE) {
            throw "assert failed";
          }
          return this.inclusionTreeDepth;
        };
        LNode.prototype.transform = function(trans) {
          var left = this.rect.x;
          if (left > LayoutConstants.WORLD_BOUNDARY) {
            left = LayoutConstants.WORLD_BOUNDARY;
          } else if (left < -LayoutConstants.WORLD_BOUNDARY) {
            left = -LayoutConstants.WORLD_BOUNDARY;
          }
          var top = this.rect.y;
          if (top > LayoutConstants.WORLD_BOUNDARY) {
            top = LayoutConstants.WORLD_BOUNDARY;
          } else if (top < -LayoutConstants.WORLD_BOUNDARY) {
            top = -LayoutConstants.WORLD_BOUNDARY;
          }
          var leftTop = new PointD(left, top);
          var vLeftTop = trans.inverseTransformPoint(leftTop);
          this.setLocation(vLeftTop.x, vLeftTop.y);
        };
        LNode.prototype.getLeft = function() {
          return this.rect.x;
        };
        LNode.prototype.getRight = function() {
          return this.rect.x + this.rect.width;
        };
        LNode.prototype.getTop = function() {
          return this.rect.y;
        };
        LNode.prototype.getBottom = function() {
          return this.rect.y + this.rect.height;
        };
        LNode.prototype.getParent = function() {
          if (this.owner == null) {
            return null;
          }
          return this.owner.getParent();
        };
        module2.exports = LNode;
      },
      function(module2, exports2, __webpack_require__) {
        function PointD(x, y) {
          if (x == null && y == null) {
            this.x = 0;
            this.y = 0;
          } else {
            this.x = x;
            this.y = y;
          }
        }
        PointD.prototype.getX = function() {
          return this.x;
        };
        PointD.prototype.getY = function() {
          return this.y;
        };
        PointD.prototype.setX = function(x) {
          this.x = x;
        };
        PointD.prototype.setY = function(y) {
          this.y = y;
        };
        PointD.prototype.getDifference = function(pt) {
          return new DimensionD(this.x - pt.x, this.y - pt.y);
        };
        PointD.prototype.getCopy = function() {
          return new PointD(this.x, this.y);
        };
        PointD.prototype.translate = function(dim) {
          this.x += dim.width;
          this.y += dim.height;
          return this;
        };
        module2.exports = PointD;
      },
      function(module2, exports2, __webpack_require__) {
        var LGraphObject = __webpack_require__(2);
        var Integer = __webpack_require__(10);
        var LayoutConstants = __webpack_require__(0);
        var LGraphManager = __webpack_require__(6);
        var LNode = __webpack_require__(3);
        var LEdge = __webpack_require__(1);
        var RectangleD = __webpack_require__(13);
        var Point2 = __webpack_require__(12);
        var LinkedList = __webpack_require__(11);
        function LGraph(parent, obj2, vGraph) {
          LGraphObject.call(this, vGraph);
          this.estimatedSize = Integer.MIN_VALUE;
          this.margin = LayoutConstants.DEFAULT_GRAPH_MARGIN;
          this.edges = [];
          this.nodes = [];
          this.isConnected = false;
          this.parent = parent;
          if (obj2 != null && obj2 instanceof LGraphManager) {
            this.graphManager = obj2;
          } else if (obj2 != null && obj2 instanceof Layout) {
            this.graphManager = obj2.graphManager;
          }
        }
        LGraph.prototype = Object.create(LGraphObject.prototype);
        for (var prop in LGraphObject) {
          LGraph[prop] = LGraphObject[prop];
        }
        LGraph.prototype.getNodes = function() {
          return this.nodes;
        };
        LGraph.prototype.getEdges = function() {
          return this.edges;
        };
        LGraph.prototype.getGraphManager = function() {
          return this.graphManager;
        };
        LGraph.prototype.getParent = function() {
          return this.parent;
        };
        LGraph.prototype.getLeft = function() {
          return this.left;
        };
        LGraph.prototype.getRight = function() {
          return this.right;
        };
        LGraph.prototype.getTop = function() {
          return this.top;
        };
        LGraph.prototype.getBottom = function() {
          return this.bottom;
        };
        LGraph.prototype.isConnected = function() {
          return this.isConnected;
        };
        LGraph.prototype.add = function(obj1, sourceNode, targetNode) {
          if (sourceNode == null && targetNode == null) {
            var newNode = obj1;
            if (this.graphManager == null) {
              throw "Graph has no graph mgr!";
            }
            if (this.getNodes().indexOf(newNode) > -1) {
              throw "Node already in graph!";
            }
            newNode.owner = this;
            this.getNodes().push(newNode);
            return newNode;
          } else {
            var newEdge = obj1;
            if (!(this.getNodes().indexOf(sourceNode) > -1 && this.getNodes().indexOf(targetNode) > -1)) {
              throw "Source or target not in graph!";
            }
            if (!(sourceNode.owner == targetNode.owner && sourceNode.owner == this)) {
              throw "Both owners must be this graph!";
            }
            if (sourceNode.owner != targetNode.owner) {
              return null;
            }
            newEdge.source = sourceNode;
            newEdge.target = targetNode;
            newEdge.isInterGraph = false;
            this.getEdges().push(newEdge);
            sourceNode.edges.push(newEdge);
            if (targetNode != sourceNode) {
              targetNode.edges.push(newEdge);
            }
            return newEdge;
          }
        };
        LGraph.prototype.remove = function(obj) {
          var node = obj;
          if (obj instanceof LNode) {
            if (node == null) {
              throw "Node is null!";
            }
            if (!(node.owner != null && node.owner == this)) {
              throw "Owner graph is invalid!";
            }
            if (this.graphManager == null) {
              throw "Owner graph manager is invalid!";
            }
            var edgesToBeRemoved = node.edges.slice();
            var edge;
            var s = edgesToBeRemoved.length;
            for (var i = 0;i < s; i++) {
              edge = edgesToBeRemoved[i];
              if (edge.isInterGraph) {
                this.graphManager.remove(edge);
              } else {
                edge.source.owner.remove(edge);
              }
            }
            var index = this.nodes.indexOf(node);
            if (index == -1) {
              throw "Node not in owner node list!";
            }
            this.nodes.splice(index, 1);
          } else if (obj instanceof LEdge) {
            var edge = obj;
            if (edge == null) {
              throw "Edge is null!";
            }
            if (!(edge.source != null && edge.target != null)) {
              throw "Source and/or target is null!";
            }
            if (!(edge.source.owner != null && edge.target.owner != null && edge.source.owner == this && edge.target.owner == this)) {
              throw "Source and/or target owner is invalid!";
            }
            var sourceIndex = edge.source.edges.indexOf(edge);
            var targetIndex = edge.target.edges.indexOf(edge);
            if (!(sourceIndex > -1 && targetIndex > -1)) {
              throw "Source and/or target doesn't know this edge!";
            }
            edge.source.edges.splice(sourceIndex, 1);
            if (edge.target != edge.source) {
              edge.target.edges.splice(targetIndex, 1);
            }
            var index = edge.source.owner.getEdges().indexOf(edge);
            if (index == -1) {
              throw "Not in owner's edge list!";
            }
            edge.source.owner.getEdges().splice(index, 1);
          }
        };
        LGraph.prototype.updateLeftTop = function() {
          var top = Integer.MAX_VALUE;
          var left = Integer.MAX_VALUE;
          var nodeTop;
          var nodeLeft;
          var margin;
          var nodes = this.getNodes();
          var s = nodes.length;
          for (var i = 0;i < s; i++) {
            var lNode = nodes[i];
            nodeTop = lNode.getTop();
            nodeLeft = lNode.getLeft();
            if (top > nodeTop) {
              top = nodeTop;
            }
            if (left > nodeLeft) {
              left = nodeLeft;
            }
          }
          if (top == Integer.MAX_VALUE) {
            return null;
          }
          if (nodes[0].getParent().paddingLeft != null) {
            margin = nodes[0].getParent().paddingLeft;
          } else {
            margin = this.margin;
          }
          this.left = left - margin;
          this.top = top - margin;
          return new Point2(this.left, this.top);
        };
        LGraph.prototype.updateBounds = function(recursive) {
          var left = Integer.MAX_VALUE;
          var right = -Integer.MAX_VALUE;
          var top = Integer.MAX_VALUE;
          var bottom = -Integer.MAX_VALUE;
          var nodeLeft;
          var nodeRight;
          var nodeTop;
          var nodeBottom;
          var margin;
          var nodes = this.nodes;
          var s = nodes.length;
          for (var i = 0;i < s; i++) {
            var lNode = nodes[i];
            if (recursive && lNode.child != null) {
              lNode.updateBounds();
            }
            nodeLeft = lNode.getLeft();
            nodeRight = lNode.getRight();
            nodeTop = lNode.getTop();
            nodeBottom = lNode.getBottom();
            if (left > nodeLeft) {
              left = nodeLeft;
            }
            if (right < nodeRight) {
              right = nodeRight;
            }
            if (top > nodeTop) {
              top = nodeTop;
            }
            if (bottom < nodeBottom) {
              bottom = nodeBottom;
            }
          }
          var boundingRect = new RectangleD(left, top, right - left, bottom - top);
          if (left == Integer.MAX_VALUE) {
            this.left = this.parent.getLeft();
            this.right = this.parent.getRight();
            this.top = this.parent.getTop();
            this.bottom = this.parent.getBottom();
          }
          if (nodes[0].getParent().paddingLeft != null) {
            margin = nodes[0].getParent().paddingLeft;
          } else {
            margin = this.margin;
          }
          this.left = boundingRect.x - margin;
          this.right = boundingRect.x + boundingRect.width + margin;
          this.top = boundingRect.y - margin;
          this.bottom = boundingRect.y + boundingRect.height + margin;
        };
        LGraph.calculateBounds = function(nodes) {
          var left = Integer.MAX_VALUE;
          var right = -Integer.MAX_VALUE;
          var top = Integer.MAX_VALUE;
          var bottom = -Integer.MAX_VALUE;
          var nodeLeft;
          var nodeRight;
          var nodeTop;
          var nodeBottom;
          var s = nodes.length;
          for (var i = 0;i < s; i++) {
            var lNode = nodes[i];
            nodeLeft = lNode.getLeft();
            nodeRight = lNode.getRight();
            nodeTop = lNode.getTop();
            nodeBottom = lNode.getBottom();
            if (left > nodeLeft) {
              left = nodeLeft;
            }
            if (right < nodeRight) {
              right = nodeRight;
            }
            if (top > nodeTop) {
              top = nodeTop;
            }
            if (bottom < nodeBottom) {
              bottom = nodeBottom;
            }
          }
          var boundingRect = new RectangleD(left, top, right - left, bottom - top);
          return boundingRect;
        };
        LGraph.prototype.getInclusionTreeDepth = function() {
          if (this == this.graphManager.getRoot()) {
            return 1;
          } else {
            return this.parent.getInclusionTreeDepth();
          }
        };
        LGraph.prototype.getEstimatedSize = function() {
          if (this.estimatedSize == Integer.MIN_VALUE) {
            throw "assert failed";
          }
          return this.estimatedSize;
        };
        LGraph.prototype.calcEstimatedSize = function() {
          var size = 0;
          var nodes = this.nodes;
          var s = nodes.length;
          for (var i = 0;i < s; i++) {
            var lNode = nodes[i];
            size += lNode.calcEstimatedSize();
          }
          if (size == 0) {
            this.estimatedSize = LayoutConstants.EMPTY_COMPOUND_NODE_SIZE;
          } else {
            this.estimatedSize = size / Math.sqrt(this.nodes.length);
          }
          return this.estimatedSize;
        };
        LGraph.prototype.updateConnected = function() {
          var self = this;
          if (this.nodes.length == 0) {
            this.isConnected = true;
            return;
          }
          var queue = new LinkedList;
          var visited = new Set;
          var currentNode = this.nodes[0];
          var neighborEdges;
          var currentNeighbor;
          var childrenOfNode = currentNode.withChildren();
          childrenOfNode.forEach(function(node) {
            queue.push(node);
            visited.add(node);
          });
          while (queue.length !== 0) {
            currentNode = queue.shift();
            neighborEdges = currentNode.getEdges();
            var size = neighborEdges.length;
            for (var i = 0;i < size; i++) {
              var neighborEdge = neighborEdges[i];
              currentNeighbor = neighborEdge.getOtherEndInGraph(currentNode, this);
              if (currentNeighbor != null && !visited.has(currentNeighbor)) {
                var childrenOfNeighbor = currentNeighbor.withChildren();
                childrenOfNeighbor.forEach(function(node) {
                  queue.push(node);
                  visited.add(node);
                });
              }
            }
          }
          this.isConnected = false;
          if (visited.size >= this.nodes.length) {
            var noOfVisitedInThisGraph = 0;
            visited.forEach(function(visitedNode) {
              if (visitedNode.owner == self) {
                noOfVisitedInThisGraph++;
              }
            });
            if (noOfVisitedInThisGraph == this.nodes.length) {
              this.isConnected = true;
            }
          }
        };
        module2.exports = LGraph;
      },
      function(module2, exports2, __webpack_require__) {
        var LGraph;
        var LEdge = __webpack_require__(1);
        function LGraphManager(layout) {
          LGraph = __webpack_require__(5);
          this.layout = layout;
          this.graphs = [];
          this.edges = [];
        }
        LGraphManager.prototype.addRoot = function() {
          var ngraph = this.layout.newGraph();
          var nnode = this.layout.newNode(null);
          var root = this.add(ngraph, nnode);
          this.setRootGraph(root);
          return this.rootGraph;
        };
        LGraphManager.prototype.add = function(newGraph, parentNode, newEdge, sourceNode, targetNode) {
          if (newEdge == null && sourceNode == null && targetNode == null) {
            if (newGraph == null) {
              throw "Graph is null!";
            }
            if (parentNode == null) {
              throw "Parent node is null!";
            }
            if (this.graphs.indexOf(newGraph) > -1) {
              throw "Graph already in this graph mgr!";
            }
            this.graphs.push(newGraph);
            if (newGraph.parent != null) {
              throw "Already has a parent!";
            }
            if (parentNode.child != null) {
              throw "Already has a child!";
            }
            newGraph.parent = parentNode;
            parentNode.child = newGraph;
            return newGraph;
          } else {
            targetNode = newEdge;
            sourceNode = parentNode;
            newEdge = newGraph;
            var sourceGraph = sourceNode.getOwner();
            var targetGraph = targetNode.getOwner();
            if (!(sourceGraph != null && sourceGraph.getGraphManager() == this)) {
              throw "Source not in this graph mgr!";
            }
            if (!(targetGraph != null && targetGraph.getGraphManager() == this)) {
              throw "Target not in this graph mgr!";
            }
            if (sourceGraph == targetGraph) {
              newEdge.isInterGraph = false;
              return sourceGraph.add(newEdge, sourceNode, targetNode);
            } else {
              newEdge.isInterGraph = true;
              newEdge.source = sourceNode;
              newEdge.target = targetNode;
              if (this.edges.indexOf(newEdge) > -1) {
                throw "Edge already in inter-graph edge list!";
              }
              this.edges.push(newEdge);
              if (!(newEdge.source != null && newEdge.target != null)) {
                throw "Edge source and/or target is null!";
              }
              if (!(newEdge.source.edges.indexOf(newEdge) == -1 && newEdge.target.edges.indexOf(newEdge) == -1)) {
                throw "Edge already in source and/or target incidency list!";
              }
              newEdge.source.edges.push(newEdge);
              newEdge.target.edges.push(newEdge);
              return newEdge;
            }
          }
        };
        LGraphManager.prototype.remove = function(lObj) {
          if (lObj instanceof LGraph) {
            var graph = lObj;
            if (graph.getGraphManager() != this) {
              throw "Graph not in this graph mgr";
            }
            if (!(graph == this.rootGraph || graph.parent != null && graph.parent.graphManager == this)) {
              throw "Invalid parent node!";
            }
            var edgesToBeRemoved = [];
            edgesToBeRemoved = edgesToBeRemoved.concat(graph.getEdges());
            var edge;
            var s = edgesToBeRemoved.length;
            for (var i = 0;i < s; i++) {
              edge = edgesToBeRemoved[i];
              graph.remove(edge);
            }
            var nodesToBeRemoved = [];
            nodesToBeRemoved = nodesToBeRemoved.concat(graph.getNodes());
            var node;
            s = nodesToBeRemoved.length;
            for (var i = 0;i < s; i++) {
              node = nodesToBeRemoved[i];
              graph.remove(node);
            }
            if (graph == this.rootGraph) {
              this.setRootGraph(null);
            }
            var index = this.graphs.indexOf(graph);
            this.graphs.splice(index, 1);
            graph.parent = null;
          } else if (lObj instanceof LEdge) {
            edge = lObj;
            if (edge == null) {
              throw "Edge is null!";
            }
            if (!edge.isInterGraph) {
              throw "Not an inter-graph edge!";
            }
            if (!(edge.source != null && edge.target != null)) {
              throw "Source and/or target is null!";
            }
            if (!(edge.source.edges.indexOf(edge) != -1 && edge.target.edges.indexOf(edge) != -1)) {
              throw "Source and/or target doesn't know this edge!";
            }
            var index = edge.source.edges.indexOf(edge);
            edge.source.edges.splice(index, 1);
            index = edge.target.edges.indexOf(edge);
            edge.target.edges.splice(index, 1);
            if (!(edge.source.owner != null && edge.source.owner.getGraphManager() != null)) {
              throw "Edge owner graph or owner graph manager is null!";
            }
            if (edge.source.owner.getGraphManager().edges.indexOf(edge) == -1) {
              throw "Not in owner graph manager's edge list!";
            }
            var index = edge.source.owner.getGraphManager().edges.indexOf(edge);
            edge.source.owner.getGraphManager().edges.splice(index, 1);
          }
        };
        LGraphManager.prototype.updateBounds = function() {
          this.rootGraph.updateBounds(true);
        };
        LGraphManager.prototype.getGraphs = function() {
          return this.graphs;
        };
        LGraphManager.prototype.getAllNodes = function() {
          if (this.allNodes == null) {
            var nodeList = [];
            var graphs = this.getGraphs();
            var s = graphs.length;
            for (var i = 0;i < s; i++) {
              nodeList = nodeList.concat(graphs[i].getNodes());
            }
            this.allNodes = nodeList;
          }
          return this.allNodes;
        };
        LGraphManager.prototype.resetAllNodes = function() {
          this.allNodes = null;
        };
        LGraphManager.prototype.resetAllEdges = function() {
          this.allEdges = null;
        };
        LGraphManager.prototype.resetAllNodesToApplyGravitation = function() {
          this.allNodesToApplyGravitation = null;
        };
        LGraphManager.prototype.getAllEdges = function() {
          if (this.allEdges == null) {
            var edgeList = [];
            var graphs = this.getGraphs();
            var s = graphs.length;
            for (var i = 0;i < graphs.length; i++) {
              edgeList = edgeList.concat(graphs[i].getEdges());
            }
            edgeList = edgeList.concat(this.edges);
            this.allEdges = edgeList;
          }
          return this.allEdges;
        };
        LGraphManager.prototype.getAllNodesToApplyGravitation = function() {
          return this.allNodesToApplyGravitation;
        };
        LGraphManager.prototype.setAllNodesToApplyGravitation = function(nodeList) {
          if (this.allNodesToApplyGravitation != null) {
            throw "assert failed";
          }
          this.allNodesToApplyGravitation = nodeList;
        };
        LGraphManager.prototype.getRoot = function() {
          return this.rootGraph;
        };
        LGraphManager.prototype.setRootGraph = function(graph) {
          if (graph.getGraphManager() != this) {
            throw "Root not in this graph mgr!";
          }
          this.rootGraph = graph;
          if (graph.parent == null) {
            graph.parent = this.layout.newNode("Root node");
          }
        };
        LGraphManager.prototype.getLayout = function() {
          return this.layout;
        };
        LGraphManager.prototype.isOneAncestorOfOther = function(firstNode, secondNode) {
          if (!(firstNode != null && secondNode != null)) {
            throw "assert failed";
          }
          if (firstNode == secondNode) {
            return true;
          }
          var ownerGraph = firstNode.getOwner();
          var parentNode;
          do {
            parentNode = ownerGraph.getParent();
            if (parentNode == null) {
              break;
            }
            if (parentNode == secondNode) {
              return true;
            }
            ownerGraph = parentNode.getOwner();
            if (ownerGraph == null) {
              break;
            }
          } while (true);
          ownerGraph = secondNode.getOwner();
          do {
            parentNode = ownerGraph.getParent();
            if (parentNode == null) {
              break;
            }
            if (parentNode == firstNode) {
              return true;
            }
            ownerGraph = parentNode.getOwner();
            if (ownerGraph == null) {
              break;
            }
          } while (true);
          return false;
        };
        LGraphManager.prototype.calcLowestCommonAncestors = function() {
          var edge;
          var sourceNode;
          var targetNode;
          var sourceAncestorGraph;
          var targetAncestorGraph;
          var edges = this.getAllEdges();
          var s = edges.length;
          for (var i = 0;i < s; i++) {
            edge = edges[i];
            sourceNode = edge.source;
            targetNode = edge.target;
            edge.lca = null;
            edge.sourceInLca = sourceNode;
            edge.targetInLca = targetNode;
            if (sourceNode == targetNode) {
              edge.lca = sourceNode.getOwner();
              continue;
            }
            sourceAncestorGraph = sourceNode.getOwner();
            while (edge.lca == null) {
              edge.targetInLca = targetNode;
              targetAncestorGraph = targetNode.getOwner();
              while (edge.lca == null) {
                if (targetAncestorGraph == sourceAncestorGraph) {
                  edge.lca = targetAncestorGraph;
                  break;
                }
                if (targetAncestorGraph == this.rootGraph) {
                  break;
                }
                if (edge.lca != null) {
                  throw "assert failed";
                }
                edge.targetInLca = targetAncestorGraph.getParent();
                targetAncestorGraph = edge.targetInLca.getOwner();
              }
              if (sourceAncestorGraph == this.rootGraph) {
                break;
              }
              if (edge.lca == null) {
                edge.sourceInLca = sourceAncestorGraph.getParent();
                sourceAncestorGraph = edge.sourceInLca.getOwner();
              }
            }
            if (edge.lca == null) {
              throw "assert failed";
            }
          }
        };
        LGraphManager.prototype.calcLowestCommonAncestor = function(firstNode, secondNode) {
          if (firstNode == secondNode) {
            return firstNode.getOwner();
          }
          var firstOwnerGraph = firstNode.getOwner();
          do {
            if (firstOwnerGraph == null) {
              break;
            }
            var secondOwnerGraph = secondNode.getOwner();
            do {
              if (secondOwnerGraph == null) {
                break;
              }
              if (secondOwnerGraph == firstOwnerGraph) {
                return secondOwnerGraph;
              }
              secondOwnerGraph = secondOwnerGraph.getParent().getOwner();
            } while (true);
            firstOwnerGraph = firstOwnerGraph.getParent().getOwner();
          } while (true);
          return firstOwnerGraph;
        };
        LGraphManager.prototype.calcInclusionTreeDepths = function(graph, depth) {
          if (graph == null && depth == null) {
            graph = this.rootGraph;
            depth = 1;
          }
          var node;
          var nodes = graph.getNodes();
          var s = nodes.length;
          for (var i = 0;i < s; i++) {
            node = nodes[i];
            node.inclusionTreeDepth = depth;
            if (node.child != null) {
              this.calcInclusionTreeDepths(node.child, depth + 1);
            }
          }
        };
        LGraphManager.prototype.includesInvalidEdge = function() {
          var edge;
          var s = this.edges.length;
          for (var i = 0;i < s; i++) {
            edge = this.edges[i];
            if (this.isOneAncestorOfOther(edge.source, edge.target)) {
              return true;
            }
          }
          return false;
        };
        module2.exports = LGraphManager;
      },
      function(module2, exports2, __webpack_require__) {
        var LayoutConstants = __webpack_require__(0);
        function FDLayoutConstants() {}
        for (var prop in LayoutConstants) {
          FDLayoutConstants[prop] = LayoutConstants[prop];
        }
        FDLayoutConstants.MAX_ITERATIONS = 2500;
        FDLayoutConstants.DEFAULT_EDGE_LENGTH = 50;
        FDLayoutConstants.DEFAULT_SPRING_STRENGTH = 0.45;
        FDLayoutConstants.DEFAULT_REPULSION_STRENGTH = 4500;
        FDLayoutConstants.DEFAULT_GRAVITY_STRENGTH = 0.4;
        FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_STRENGTH = 1;
        FDLayoutConstants.DEFAULT_GRAVITY_RANGE_FACTOR = 3.8;
        FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR = 1.5;
        FDLayoutConstants.DEFAULT_USE_SMART_IDEAL_EDGE_LENGTH_CALCULATION = true;
        FDLayoutConstants.DEFAULT_USE_SMART_REPULSION_RANGE_CALCULATION = true;
        FDLayoutConstants.DEFAULT_COOLING_FACTOR_INCREMENTAL = 0.3;
        FDLayoutConstants.COOLING_ADAPTATION_FACTOR = 0.33;
        FDLayoutConstants.ADAPTATION_LOWER_NODE_LIMIT = 1000;
        FDLayoutConstants.ADAPTATION_UPPER_NODE_LIMIT = 5000;
        FDLayoutConstants.MAX_NODE_DISPLACEMENT_INCREMENTAL = 100;
        FDLayoutConstants.MAX_NODE_DISPLACEMENT = FDLayoutConstants.MAX_NODE_DISPLACEMENT_INCREMENTAL * 3;
        FDLayoutConstants.MIN_REPULSION_DIST = FDLayoutConstants.DEFAULT_EDGE_LENGTH / 10;
        FDLayoutConstants.CONVERGENCE_CHECK_PERIOD = 100;
        FDLayoutConstants.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR = 0.1;
        FDLayoutConstants.MIN_EDGE_LENGTH = 1;
        FDLayoutConstants.GRID_CALCULATION_CHECK_PERIOD = 10;
        module2.exports = FDLayoutConstants;
      },
      function(module2, exports2, __webpack_require__) {
        var Point2 = __webpack_require__(12);
        function IGeometry() {}
        IGeometry.calcSeparationAmount = function(rectA, rectB, overlapAmount, separationBuffer) {
          if (!rectA.intersects(rectB)) {
            throw "assert failed";
          }
          var directions = new Array(2);
          this.decideDirectionsForOverlappingNodes(rectA, rectB, directions);
          overlapAmount[0] = Math.min(rectA.getRight(), rectB.getRight()) - Math.max(rectA.x, rectB.x);
          overlapAmount[1] = Math.min(rectA.getBottom(), rectB.getBottom()) - Math.max(rectA.y, rectB.y);
          if (rectA.getX() <= rectB.getX() && rectA.getRight() >= rectB.getRight()) {
            overlapAmount[0] += Math.min(rectB.getX() - rectA.getX(), rectA.getRight() - rectB.getRight());
          } else if (rectB.getX() <= rectA.getX() && rectB.getRight() >= rectA.getRight()) {
            overlapAmount[0] += Math.min(rectA.getX() - rectB.getX(), rectB.getRight() - rectA.getRight());
          }
          if (rectA.getY() <= rectB.getY() && rectA.getBottom() >= rectB.getBottom()) {
            overlapAmount[1] += Math.min(rectB.getY() - rectA.getY(), rectA.getBottom() - rectB.getBottom());
          } else if (rectB.getY() <= rectA.getY() && rectB.getBottom() >= rectA.getBottom()) {
            overlapAmount[1] += Math.min(rectA.getY() - rectB.getY(), rectB.getBottom() - rectA.getBottom());
          }
          var slope = Math.abs((rectB.getCenterY() - rectA.getCenterY()) / (rectB.getCenterX() - rectA.getCenterX()));
          if (rectB.getCenterY() === rectA.getCenterY() && rectB.getCenterX() === rectA.getCenterX()) {
            slope = 1;
          }
          var moveByY = slope * overlapAmount[0];
          var moveByX = overlapAmount[1] / slope;
          if (overlapAmount[0] < moveByX) {
            moveByX = overlapAmount[0];
          } else {
            moveByY = overlapAmount[1];
          }
          overlapAmount[0] = -1 * directions[0] * (moveByX / 2 + separationBuffer);
          overlapAmount[1] = -1 * directions[1] * (moveByY / 2 + separationBuffer);
        };
        IGeometry.decideDirectionsForOverlappingNodes = function(rectA, rectB, directions) {
          if (rectA.getCenterX() < rectB.getCenterX()) {
            directions[0] = -1;
          } else {
            directions[0] = 1;
          }
          if (rectA.getCenterY() < rectB.getCenterY()) {
            directions[1] = -1;
          } else {
            directions[1] = 1;
          }
        };
        IGeometry.getIntersection2 = function(rectA, rectB, result) {
          var p1x = rectA.getCenterX();
          var p1y = rectA.getCenterY();
          var p2x = rectB.getCenterX();
          var p2y = rectB.getCenterY();
          if (rectA.intersects(rectB)) {
            result[0] = p1x;
            result[1] = p1y;
            result[2] = p2x;
            result[3] = p2y;
            return true;
          }
          var topLeftAx = rectA.getX();
          var topLeftAy = rectA.getY();
          var topRightAx = rectA.getRight();
          var bottomLeftAx = rectA.getX();
          var bottomLeftAy = rectA.getBottom();
          var bottomRightAx = rectA.getRight();
          var halfWidthA = rectA.getWidthHalf();
          var halfHeightA = rectA.getHeightHalf();
          var topLeftBx = rectB.getX();
          var topLeftBy = rectB.getY();
          var topRightBx = rectB.getRight();
          var bottomLeftBx = rectB.getX();
          var bottomLeftBy = rectB.getBottom();
          var bottomRightBx = rectB.getRight();
          var halfWidthB = rectB.getWidthHalf();
          var halfHeightB = rectB.getHeightHalf();
          var clipPointAFound = false;
          var clipPointBFound = false;
          if (p1x === p2x) {
            if (p1y > p2y) {
              result[0] = p1x;
              result[1] = topLeftAy;
              result[2] = p2x;
              result[3] = bottomLeftBy;
              return false;
            } else if (p1y < p2y) {
              result[0] = p1x;
              result[1] = bottomLeftAy;
              result[2] = p2x;
              result[3] = topLeftBy;
              return false;
            } else {}
          } else if (p1y === p2y) {
            if (p1x > p2x) {
              result[0] = topLeftAx;
              result[1] = p1y;
              result[2] = topRightBx;
              result[3] = p2y;
              return false;
            } else if (p1x < p2x) {
              result[0] = topRightAx;
              result[1] = p1y;
              result[2] = topLeftBx;
              result[3] = p2y;
              return false;
            } else {}
          } else {
            var slopeA = rectA.height / rectA.width;
            var slopeB = rectB.height / rectB.width;
            var slopePrime = (p2y - p1y) / (p2x - p1x);
            var cardinalDirectionA = undefined;
            var cardinalDirectionB = undefined;
            var tempPointAx = undefined;
            var tempPointAy = undefined;
            var tempPointBx = undefined;
            var tempPointBy = undefined;
            if (-slopeA === slopePrime) {
              if (p1x > p2x) {
                result[0] = bottomLeftAx;
                result[1] = bottomLeftAy;
                clipPointAFound = true;
              } else {
                result[0] = topRightAx;
                result[1] = topLeftAy;
                clipPointAFound = true;
              }
            } else if (slopeA === slopePrime) {
              if (p1x > p2x) {
                result[0] = topLeftAx;
                result[1] = topLeftAy;
                clipPointAFound = true;
              } else {
                result[0] = bottomRightAx;
                result[1] = bottomLeftAy;
                clipPointAFound = true;
              }
            }
            if (-slopeB === slopePrime) {
              if (p2x > p1x) {
                result[2] = bottomLeftBx;
                result[3] = bottomLeftBy;
                clipPointBFound = true;
              } else {
                result[2] = topRightBx;
                result[3] = topLeftBy;
                clipPointBFound = true;
              }
            } else if (slopeB === slopePrime) {
              if (p2x > p1x) {
                result[2] = topLeftBx;
                result[3] = topLeftBy;
                clipPointBFound = true;
              } else {
                result[2] = bottomRightBx;
                result[3] = bottomLeftBy;
                clipPointBFound = true;
              }
            }
            if (clipPointAFound && clipPointBFound) {
              return false;
            }
            if (p1x > p2x) {
              if (p1y > p2y) {
                cardinalDirectionA = this.getCardinalDirection(slopeA, slopePrime, 4);
                cardinalDirectionB = this.getCardinalDirection(slopeB, slopePrime, 2);
              } else {
                cardinalDirectionA = this.getCardinalDirection(-slopeA, slopePrime, 3);
                cardinalDirectionB = this.getCardinalDirection(-slopeB, slopePrime, 1);
              }
            } else {
              if (p1y > p2y) {
                cardinalDirectionA = this.getCardinalDirection(-slopeA, slopePrime, 1);
                cardinalDirectionB = this.getCardinalDirection(-slopeB, slopePrime, 3);
              } else {
                cardinalDirectionA = this.getCardinalDirection(slopeA, slopePrime, 2);
                cardinalDirectionB = this.getCardinalDirection(slopeB, slopePrime, 4);
              }
            }
            if (!clipPointAFound) {
              switch (cardinalDirectionA) {
                case 1:
                  tempPointAy = topLeftAy;
                  tempPointAx = p1x + -halfHeightA / slopePrime;
                  result[0] = tempPointAx;
                  result[1] = tempPointAy;
                  break;
                case 2:
                  tempPointAx = bottomRightAx;
                  tempPointAy = p1y + halfWidthA * slopePrime;
                  result[0] = tempPointAx;
                  result[1] = tempPointAy;
                  break;
                case 3:
                  tempPointAy = bottomLeftAy;
                  tempPointAx = p1x + halfHeightA / slopePrime;
                  result[0] = tempPointAx;
                  result[1] = tempPointAy;
                  break;
                case 4:
                  tempPointAx = bottomLeftAx;
                  tempPointAy = p1y + -halfWidthA * slopePrime;
                  result[0] = tempPointAx;
                  result[1] = tempPointAy;
                  break;
              }
            }
            if (!clipPointBFound) {
              switch (cardinalDirectionB) {
                case 1:
                  tempPointBy = topLeftBy;
                  tempPointBx = p2x + -halfHeightB / slopePrime;
                  result[2] = tempPointBx;
                  result[3] = tempPointBy;
                  break;
                case 2:
                  tempPointBx = bottomRightBx;
                  tempPointBy = p2y + halfWidthB * slopePrime;
                  result[2] = tempPointBx;
                  result[3] = tempPointBy;
                  break;
                case 3:
                  tempPointBy = bottomLeftBy;
                  tempPointBx = p2x + halfHeightB / slopePrime;
                  result[2] = tempPointBx;
                  result[3] = tempPointBy;
                  break;
                case 4:
                  tempPointBx = bottomLeftBx;
                  tempPointBy = p2y + -halfWidthB * slopePrime;
                  result[2] = tempPointBx;
                  result[3] = tempPointBy;
                  break;
              }
            }
          }
          return false;
        };
        IGeometry.getCardinalDirection = function(slope, slopePrime, line) {
          if (slope > slopePrime) {
            return line;
          } else {
            return 1 + line % 4;
          }
        };
        IGeometry.getIntersection = function(s1, s2, f1, f2) {
          if (f2 == null) {
            return this.getIntersection2(s1, s2, f1);
          }
          var x1 = s1.x;
          var y1 = s1.y;
          var x2 = s2.x;
          var y2 = s2.y;
          var x3 = f1.x;
          var y3 = f1.y;
          var x4 = f2.x;
          var y4 = f2.y;
          var x = undefined, y = undefined;
          var a1 = undefined, a2 = undefined, b1 = undefined, b2 = undefined, c1 = undefined, c2 = undefined;
          var denom = undefined;
          a1 = y2 - y1;
          b1 = x1 - x2;
          c1 = x2 * y1 - x1 * y2;
          a2 = y4 - y3;
          b2 = x3 - x4;
          c2 = x4 * y3 - x3 * y4;
          denom = a1 * b2 - a2 * b1;
          if (denom === 0) {
            return null;
          }
          x = (b1 * c2 - b2 * c1) / denom;
          y = (a2 * c1 - a1 * c2) / denom;
          return new Point2(x, y);
        };
        IGeometry.angleOfVector = function(Cx, Cy, Nx, Ny) {
          var C_angle = undefined;
          if (Cx !== Nx) {
            C_angle = Math.atan((Ny - Cy) / (Nx - Cx));
            if (Nx < Cx) {
              C_angle += Math.PI;
            } else if (Ny < Cy) {
              C_angle += this.TWO_PI;
            }
          } else if (Ny < Cy) {
            C_angle = this.ONE_AND_HALF_PI;
          } else {
            C_angle = this.HALF_PI;
          }
          return C_angle;
        };
        IGeometry.doIntersect = function(p1, p2, p3, p4) {
          var a = p1.x;
          var b = p1.y;
          var c = p2.x;
          var d = p2.y;
          var p = p3.x;
          var q = p3.y;
          var r = p4.x;
          var s = p4.y;
          var det = (c - a) * (s - q) - (r - p) * (d - b);
          if (det === 0) {
            return false;
          } else {
            var lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
            var gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
            return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
          }
        };
        IGeometry.HALF_PI = 0.5 * Math.PI;
        IGeometry.ONE_AND_HALF_PI = 1.5 * Math.PI;
        IGeometry.TWO_PI = 2 * Math.PI;
        IGeometry.THREE_PI = 3 * Math.PI;
        module2.exports = IGeometry;
      },
      function(module2, exports2, __webpack_require__) {
        function IMath() {}
        IMath.sign = function(value) {
          if (value > 0) {
            return 1;
          } else if (value < 0) {
            return -1;
          } else {
            return 0;
          }
        };
        IMath.floor = function(value) {
          return value < 0 ? Math.ceil(value) : Math.floor(value);
        };
        IMath.ceil = function(value) {
          return value < 0 ? Math.floor(value) : Math.ceil(value);
        };
        module2.exports = IMath;
      },
      function(module2, exports2, __webpack_require__) {
        function Integer() {}
        Integer.MAX_VALUE = 2147483647;
        Integer.MIN_VALUE = -2147483648;
        module2.exports = Integer;
      },
      function(module2, exports2, __webpack_require__) {
        var _createClass = function() {
          function defineProperties(target, props) {
            for (var i = 0;i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || false;
              descriptor.configurable = true;
              if ("value" in descriptor)
                descriptor.writable = true;
              Object.defineProperty(target, descriptor.key, descriptor);
            }
          }
          return function(Constructor, protoProps, staticProps) {
            if (protoProps)
              defineProperties(Constructor.prototype, protoProps);
            if (staticProps)
              defineProperties(Constructor, staticProps);
            return Constructor;
          };
        }();
        function _classCallCheck(instance2, Constructor) {
          if (!(instance2 instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
          }
        }
        var nodeFrom = function nodeFrom2(value) {
          return { value, next: null, prev: null };
        };
        var add = function add2(prev, node, next2, list) {
          if (prev !== null) {
            prev.next = node;
          } else {
            list.head = node;
          }
          if (next2 !== null) {
            next2.prev = node;
          } else {
            list.tail = node;
          }
          node.prev = prev;
          node.next = next2;
          list.length++;
          return node;
        };
        var _remove = function _remove2(node, list) {
          var { prev, next: next2 } = node;
          if (prev !== null) {
            prev.next = next2;
          } else {
            list.head = next2;
          }
          if (next2 !== null) {
            next2.prev = prev;
          } else {
            list.tail = prev;
          }
          node.prev = node.next = null;
          list.length--;
          return node;
        };
        var LinkedList = function() {
          function LinkedList2(vals) {
            var _this = this;
            _classCallCheck(this, LinkedList2);
            this.length = 0;
            this.head = null;
            this.tail = null;
            if (vals != null) {
              vals.forEach(function(v) {
                return _this.push(v);
              });
            }
          }
          _createClass(LinkedList2, [{
            key: "size",
            value: function size() {
              return this.length;
            }
          }, {
            key: "insertBefore",
            value: function insertBefore(val, otherNode) {
              return add(otherNode.prev, nodeFrom(val), otherNode, this);
            }
          }, {
            key: "insertAfter",
            value: function insertAfter(val, otherNode) {
              return add(otherNode, nodeFrom(val), otherNode.next, this);
            }
          }, {
            key: "insertNodeBefore",
            value: function insertNodeBefore(newNode, otherNode) {
              return add(otherNode.prev, newNode, otherNode, this);
            }
          }, {
            key: "insertNodeAfter",
            value: function insertNodeAfter(newNode, otherNode) {
              return add(otherNode, newNode, otherNode.next, this);
            }
          }, {
            key: "push",
            value: function push(val) {
              return add(this.tail, nodeFrom(val), null, this);
            }
          }, {
            key: "unshift",
            value: function unshift(val) {
              return add(null, nodeFrom(val), this.head, this);
            }
          }, {
            key: "remove",
            value: function remove(node) {
              return _remove(node, this);
            }
          }, {
            key: "pop",
            value: function pop() {
              return _remove(this.tail, this).value;
            }
          }, {
            key: "popNode",
            value: function popNode() {
              return _remove(this.tail, this);
            }
          }, {
            key: "shift",
            value: function shift() {
              return _remove(this.head, this).value;
            }
          }, {
            key: "shiftNode",
            value: function shiftNode() {
              return _remove(this.head, this);
            }
          }, {
            key: "get_object_at",
            value: function get_object_at(index) {
              if (index <= this.length()) {
                var i = 1;
                var current = this.head;
                while (i < index) {
                  current = current.next;
                  i++;
                }
                return current.value;
              }
            }
          }, {
            key: "set_object_at",
            value: function set_object_at(index, value) {
              if (index <= this.length()) {
                var i = 1;
                var current = this.head;
                while (i < index) {
                  current = current.next;
                  i++;
                }
                current.value = value;
              }
            }
          }]);
          return LinkedList2;
        }();
        module2.exports = LinkedList;
      },
      function(module2, exports2, __webpack_require__) {
        function Point2(x, y, p) {
          this.x = null;
          this.y = null;
          if (x == null && y == null && p == null) {
            this.x = 0;
            this.y = 0;
          } else if (typeof x == "number" && typeof y == "number" && p == null) {
            this.x = x;
            this.y = y;
          } else if (x.constructor.name == "Point" && y == null && p == null) {
            p = x;
            this.x = p.x;
            this.y = p.y;
          }
        }
        Point2.prototype.getX = function() {
          return this.x;
        };
        Point2.prototype.getY = function() {
          return this.y;
        };
        Point2.prototype.getLocation = function() {
          return new Point2(this.x, this.y);
        };
        Point2.prototype.setLocation = function(x, y, p) {
          if (x.constructor.name == "Point" && y == null && p == null) {
            p = x;
            this.setLocation(p.x, p.y);
          } else if (typeof x == "number" && typeof y == "number" && p == null) {
            if (parseInt(x) == x && parseInt(y) == y) {
              this.move(x, y);
            } else {
              this.x = Math.floor(x + 0.5);
              this.y = Math.floor(y + 0.5);
            }
          }
        };
        Point2.prototype.move = function(x, y) {
          this.x = x;
          this.y = y;
        };
        Point2.prototype.translate = function(dx, dy) {
          this.x += dx;
          this.y += dy;
        };
        Point2.prototype.equals = function(obj) {
          if (obj.constructor.name == "Point") {
            var pt = obj;
            return this.x == pt.x && this.y == pt.y;
          }
          return this == obj;
        };
        Point2.prototype.toString = function() {
          return new Point2().constructor.name + "[x=" + this.x + ",y=" + this.y + "]";
        };
        module2.exports = Point2;
      },
      function(module2, exports2, __webpack_require__) {
        function RectangleD(x, y, width, height) {
          this.x = 0;
          this.y = 0;
          this.width = 0;
          this.height = 0;
          if (x != null && y != null && width != null && height != null) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
          }
        }
        RectangleD.prototype.getX = function() {
          return this.x;
        };
        RectangleD.prototype.setX = function(x) {
          this.x = x;
        };
        RectangleD.prototype.getY = function() {
          return this.y;
        };
        RectangleD.prototype.setY = function(y) {
          this.y = y;
        };
        RectangleD.prototype.getWidth = function() {
          return this.width;
        };
        RectangleD.prototype.setWidth = function(width) {
          this.width = width;
        };
        RectangleD.prototype.getHeight = function() {
          return this.height;
        };
        RectangleD.prototype.setHeight = function(height) {
          this.height = height;
        };
        RectangleD.prototype.getRight = function() {
          return this.x + this.width;
        };
        RectangleD.prototype.getBottom = function() {
          return this.y + this.height;
        };
        RectangleD.prototype.intersects = function(a) {
          if (this.getRight() < a.x) {
            return false;
          }
          if (this.getBottom() < a.y) {
            return false;
          }
          if (a.getRight() < this.x) {
            return false;
          }
          if (a.getBottom() < this.y) {
            return false;
          }
          return true;
        };
        RectangleD.prototype.getCenterX = function() {
          return this.x + this.width / 2;
        };
        RectangleD.prototype.getMinX = function() {
          return this.getX();
        };
        RectangleD.prototype.getMaxX = function() {
          return this.getX() + this.width;
        };
        RectangleD.prototype.getCenterY = function() {
          return this.y + this.height / 2;
        };
        RectangleD.prototype.getMinY = function() {
          return this.getY();
        };
        RectangleD.prototype.getMaxY = function() {
          return this.getY() + this.height;
        };
        RectangleD.prototype.getWidthHalf = function() {
          return this.width / 2;
        };
        RectangleD.prototype.getHeightHalf = function() {
          return this.height / 2;
        };
        module2.exports = RectangleD;
      },
      function(module2, exports2, __webpack_require__) {
        var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
          return typeof obj;
        } : function(obj) {
          return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
        function UniqueIDGeneretor() {}
        UniqueIDGeneretor.lastID = 0;
        UniqueIDGeneretor.createID = function(obj) {
          if (UniqueIDGeneretor.isPrimitive(obj)) {
            return obj;
          }
          if (obj.uniqueID != null) {
            return obj.uniqueID;
          }
          obj.uniqueID = UniqueIDGeneretor.getString();
          UniqueIDGeneretor.lastID++;
          return obj.uniqueID;
        };
        UniqueIDGeneretor.getString = function(id) {
          if (id == null)
            id = UniqueIDGeneretor.lastID;
          return "Object#" + id + "";
        };
        UniqueIDGeneretor.isPrimitive = function(arg) {
          var type = typeof arg === "undefined" ? "undefined" : _typeof(arg);
          return arg == null || type != "object" && type != "function";
        };
        module2.exports = UniqueIDGeneretor;
      },
      function(module2, exports2, __webpack_require__) {
        function _toConsumableArray(arr) {
          if (Array.isArray(arr)) {
            for (var i = 0, arr2 = Array(arr.length);i < arr.length; i++) {
              arr2[i] = arr[i];
            }
            return arr2;
          } else {
            return Array.from(arr);
          }
        }
        var LayoutConstants = __webpack_require__(0);
        var LGraphManager = __webpack_require__(6);
        var LNode = __webpack_require__(3);
        var LEdge = __webpack_require__(1);
        var LGraph = __webpack_require__(5);
        var PointD = __webpack_require__(4);
        var Transform = __webpack_require__(17);
        var Emitter = __webpack_require__(27);
        function Layout2(isRemoteUse) {
          Emitter.call(this);
          this.layoutQuality = LayoutConstants.QUALITY;
          this.createBendsAsNeeded = LayoutConstants.DEFAULT_CREATE_BENDS_AS_NEEDED;
          this.incremental = LayoutConstants.DEFAULT_INCREMENTAL;
          this.animationOnLayout = LayoutConstants.DEFAULT_ANIMATION_ON_LAYOUT;
          this.animationDuringLayout = LayoutConstants.DEFAULT_ANIMATION_DURING_LAYOUT;
          this.animationPeriod = LayoutConstants.DEFAULT_ANIMATION_PERIOD;
          this.uniformLeafNodeSizes = LayoutConstants.DEFAULT_UNIFORM_LEAF_NODE_SIZES;
          this.edgeToDummyNodes = new Map;
          this.graphManager = new LGraphManager(this);
          this.isLayoutFinished = false;
          this.isSubLayout = false;
          this.isRemoteUse = false;
          if (isRemoteUse != null) {
            this.isRemoteUse = isRemoteUse;
          }
        }
        Layout2.RANDOM_SEED = 1;
        Layout2.prototype = Object.create(Emitter.prototype);
        Layout2.prototype.getGraphManager = function() {
          return this.graphManager;
        };
        Layout2.prototype.getAllNodes = function() {
          return this.graphManager.getAllNodes();
        };
        Layout2.prototype.getAllEdges = function() {
          return this.graphManager.getAllEdges();
        };
        Layout2.prototype.getAllNodesToApplyGravitation = function() {
          return this.graphManager.getAllNodesToApplyGravitation();
        };
        Layout2.prototype.newGraphManager = function() {
          var gm = new LGraphManager(this);
          this.graphManager = gm;
          return gm;
        };
        Layout2.prototype.newGraph = function(vGraph) {
          return new LGraph(null, this.graphManager, vGraph);
        };
        Layout2.prototype.newNode = function(vNode) {
          return new LNode(this.graphManager, vNode);
        };
        Layout2.prototype.newEdge = function(vEdge) {
          return new LEdge(null, null, vEdge);
        };
        Layout2.prototype.checkLayoutSuccess = function() {
          return this.graphManager.getRoot() == null || this.graphManager.getRoot().getNodes().length == 0 || this.graphManager.includesInvalidEdge();
        };
        Layout2.prototype.runLayout = function() {
          this.isLayoutFinished = false;
          if (this.tilingPreLayout) {
            this.tilingPreLayout();
          }
          this.initParameters();
          var isLayoutSuccessfull;
          if (this.checkLayoutSuccess()) {
            isLayoutSuccessfull = false;
          } else {
            isLayoutSuccessfull = this.layout();
          }
          if (LayoutConstants.ANIMATE === "during") {
            return false;
          }
          if (isLayoutSuccessfull) {
            if (!this.isSubLayout) {
              this.doPostLayout();
            }
          }
          if (this.tilingPostLayout) {
            this.tilingPostLayout();
          }
          this.isLayoutFinished = true;
          return isLayoutSuccessfull;
        };
        Layout2.prototype.doPostLayout = function() {
          if (!this.incremental) {
            this.transform();
          }
          this.update();
        };
        Layout2.prototype.update2 = function() {
          if (this.createBendsAsNeeded) {
            this.createBendpointsFromDummyNodes();
            this.graphManager.resetAllEdges();
          }
          if (!this.isRemoteUse) {
            var edge;
            var allEdges = this.graphManager.getAllEdges();
            for (var i = 0;i < allEdges.length; i++) {
              edge = allEdges[i];
            }
            var node;
            var nodes = this.graphManager.getRoot().getNodes();
            for (var i = 0;i < nodes.length; i++) {
              node = nodes[i];
            }
            this.update(this.graphManager.getRoot());
          }
        };
        Layout2.prototype.update = function(obj) {
          if (obj == null) {
            this.update2();
          } else if (obj instanceof LNode) {
            var node = obj;
            if (node.getChild() != null) {
              var nodes = node.getChild().getNodes();
              for (var i = 0;i < nodes.length; i++) {
                update(nodes[i]);
              }
            }
            if (node.vGraphObject != null) {
              var vNode = node.vGraphObject;
              vNode.update(node);
            }
          } else if (obj instanceof LEdge) {
            var edge = obj;
            if (edge.vGraphObject != null) {
              var vEdge = edge.vGraphObject;
              vEdge.update(edge);
            }
          } else if (obj instanceof LGraph) {
            var graph = obj;
            if (graph.vGraphObject != null) {
              var vGraph = graph.vGraphObject;
              vGraph.update(graph);
            }
          }
        };
        Layout2.prototype.initParameters = function() {
          if (!this.isSubLayout) {
            this.layoutQuality = LayoutConstants.QUALITY;
            this.animationDuringLayout = LayoutConstants.DEFAULT_ANIMATION_DURING_LAYOUT;
            this.animationPeriod = LayoutConstants.DEFAULT_ANIMATION_PERIOD;
            this.animationOnLayout = LayoutConstants.DEFAULT_ANIMATION_ON_LAYOUT;
            this.incremental = LayoutConstants.DEFAULT_INCREMENTAL;
            this.createBendsAsNeeded = LayoutConstants.DEFAULT_CREATE_BENDS_AS_NEEDED;
            this.uniformLeafNodeSizes = LayoutConstants.DEFAULT_UNIFORM_LEAF_NODE_SIZES;
          }
          if (this.animationDuringLayout) {
            this.animationOnLayout = false;
          }
        };
        Layout2.prototype.transform = function(newLeftTop) {
          if (newLeftTop == undefined) {
            this.transform(new PointD(0, 0));
          } else {
            var trans = new Transform;
            var leftTop = this.graphManager.getRoot().updateLeftTop();
            if (leftTop != null) {
              trans.setWorldOrgX(newLeftTop.x);
              trans.setWorldOrgY(newLeftTop.y);
              trans.setDeviceOrgX(leftTop.x);
              trans.setDeviceOrgY(leftTop.y);
              var nodes = this.getAllNodes();
              var node;
              for (var i = 0;i < nodes.length; i++) {
                node = nodes[i];
                node.transform(trans);
              }
            }
          }
        };
        Layout2.prototype.positionNodesRandomly = function(graph) {
          if (graph == undefined) {
            this.positionNodesRandomly(this.getGraphManager().getRoot());
            this.getGraphManager().getRoot().updateBounds(true);
          } else {
            var lNode;
            var childGraph;
            var nodes = graph.getNodes();
            for (var i = 0;i < nodes.length; i++) {
              lNode = nodes[i];
              childGraph = lNode.getChild();
              if (childGraph == null) {
                lNode.scatter();
              } else if (childGraph.getNodes().length == 0) {
                lNode.scatter();
              } else {
                this.positionNodesRandomly(childGraph);
                lNode.updateBounds();
              }
            }
          }
        };
        Layout2.prototype.getFlatForest = function() {
          var flatForest = [];
          var isForest = true;
          var allNodes = this.graphManager.getRoot().getNodes();
          var isFlat = true;
          for (var i = 0;i < allNodes.length; i++) {
            if (allNodes[i].getChild() != null) {
              isFlat = false;
            }
          }
          if (!isFlat) {
            return flatForest;
          }
          var visited = new Set;
          var toBeVisited = [];
          var parents = new Map;
          var unProcessedNodes = [];
          unProcessedNodes = unProcessedNodes.concat(allNodes);
          while (unProcessedNodes.length > 0 && isForest) {
            toBeVisited.push(unProcessedNodes[0]);
            while (toBeVisited.length > 0 && isForest) {
              var currentNode = toBeVisited[0];
              toBeVisited.splice(0, 1);
              visited.add(currentNode);
              var neighborEdges = currentNode.getEdges();
              for (var i = 0;i < neighborEdges.length; i++) {
                var currentNeighbor = neighborEdges[i].getOtherEnd(currentNode);
                if (parents.get(currentNode) != currentNeighbor) {
                  if (!visited.has(currentNeighbor)) {
                    toBeVisited.push(currentNeighbor);
                    parents.set(currentNeighbor, currentNode);
                  } else {
                    isForest = false;
                    break;
                  }
                }
              }
            }
            if (!isForest) {
              flatForest = [];
            } else {
              var temp = [].concat(_toConsumableArray(visited));
              flatForest.push(temp);
              for (var i = 0;i < temp.length; i++) {
                var value = temp[i];
                var index = unProcessedNodes.indexOf(value);
                if (index > -1) {
                  unProcessedNodes.splice(index, 1);
                }
              }
              visited = new Set;
              parents = new Map;
            }
          }
          return flatForest;
        };
        Layout2.prototype.createDummyNodesForBendpoints = function(edge) {
          var dummyNodes = [];
          var prev = edge.source;
          var graph = this.graphManager.calcLowestCommonAncestor(edge.source, edge.target);
          for (var i = 0;i < edge.bendpoints.length; i++) {
            var dummyNode = this.newNode(null);
            dummyNode.setRect(new Point(0, 0), new Dimension(1, 1));
            graph.add(dummyNode);
            var dummyEdge = this.newEdge(null);
            this.graphManager.add(dummyEdge, prev, dummyNode);
            dummyNodes.add(dummyNode);
            prev = dummyNode;
          }
          var dummyEdge = this.newEdge(null);
          this.graphManager.add(dummyEdge, prev, edge.target);
          this.edgeToDummyNodes.set(edge, dummyNodes);
          if (edge.isInterGraph()) {
            this.graphManager.remove(edge);
          } else {
            graph.remove(edge);
          }
          return dummyNodes;
        };
        Layout2.prototype.createBendpointsFromDummyNodes = function() {
          var edges = [];
          edges = edges.concat(this.graphManager.getAllEdges());
          edges = [].concat(_toConsumableArray(this.edgeToDummyNodes.keys())).concat(edges);
          for (var k = 0;k < edges.length; k++) {
            var lEdge = edges[k];
            if (lEdge.bendpoints.length > 0) {
              var path = this.edgeToDummyNodes.get(lEdge);
              for (var i = 0;i < path.length; i++) {
                var dummyNode = path[i];
                var p = new PointD(dummyNode.getCenterX(), dummyNode.getCenterY());
                var ebp = lEdge.bendpoints.get(i);
                ebp.x = p.x;
                ebp.y = p.y;
                dummyNode.getOwner().remove(dummyNode);
              }
              this.graphManager.add(lEdge, lEdge.source, lEdge.target);
            }
          }
        };
        Layout2.transform = function(sliderValue, defaultValue, minDiv, maxMul) {
          if (minDiv != null && maxMul != null) {
            var value = defaultValue;
            if (sliderValue <= 50) {
              var minValue = defaultValue / minDiv;
              value -= (defaultValue - minValue) / 50 * (50 - sliderValue);
            } else {
              var maxValue = defaultValue * maxMul;
              value += (maxValue - defaultValue) / 50 * (sliderValue - 50);
            }
            return value;
          } else {
            var a, b;
            if (sliderValue <= 50) {
              a = 9 * defaultValue / 500;
              b = defaultValue / 10;
            } else {
              a = 9 * defaultValue / 50;
              b = -8 * defaultValue;
            }
            return a * sliderValue + b;
          }
        };
        Layout2.findCenterOfTree = function(nodes) {
          var list = [];
          list = list.concat(nodes);
          var removedNodes = [];
          var remainingDegrees = new Map;
          var foundCenter = false;
          var centerNode = null;
          if (list.length == 1 || list.length == 2) {
            foundCenter = true;
            centerNode = list[0];
          }
          for (var i = 0;i < list.length; i++) {
            var node = list[i];
            var degree = node.getNeighborsList().size;
            remainingDegrees.set(node, node.getNeighborsList().size);
            if (degree == 1) {
              removedNodes.push(node);
            }
          }
          var tempList = [];
          tempList = tempList.concat(removedNodes);
          while (!foundCenter) {
            var tempList2 = [];
            tempList2 = tempList2.concat(tempList);
            tempList = [];
            for (var i = 0;i < list.length; i++) {
              var node = list[i];
              var index = list.indexOf(node);
              if (index >= 0) {
                list.splice(index, 1);
              }
              var neighbours = node.getNeighborsList();
              neighbours.forEach(function(neighbour) {
                if (removedNodes.indexOf(neighbour) < 0) {
                  var otherDegree = remainingDegrees.get(neighbour);
                  var newDegree = otherDegree - 1;
                  if (newDegree == 1) {
                    tempList.push(neighbour);
                  }
                  remainingDegrees.set(neighbour, newDegree);
                }
              });
            }
            removedNodes = removedNodes.concat(tempList);
            if (list.length == 1 || list.length == 2) {
              foundCenter = true;
              centerNode = list[0];
            }
          }
          return centerNode;
        };
        Layout2.prototype.setGraphManager = function(gm) {
          this.graphManager = gm;
        };
        module2.exports = Layout2;
      },
      function(module2, exports2, __webpack_require__) {
        function RandomSeed() {}
        RandomSeed.seed = 1;
        RandomSeed.x = 0;
        RandomSeed.nextDouble = function() {
          RandomSeed.x = Math.sin(RandomSeed.seed++) * 1e4;
          return RandomSeed.x - Math.floor(RandomSeed.x);
        };
        module2.exports = RandomSeed;
      },
      function(module2, exports2, __webpack_require__) {
        var PointD = __webpack_require__(4);
        function Transform(x, y) {
          this.lworldOrgX = 0;
          this.lworldOrgY = 0;
          this.ldeviceOrgX = 0;
          this.ldeviceOrgY = 0;
          this.lworldExtX = 1;
          this.lworldExtY = 1;
          this.ldeviceExtX = 1;
          this.ldeviceExtY = 1;
        }
        Transform.prototype.getWorldOrgX = function() {
          return this.lworldOrgX;
        };
        Transform.prototype.setWorldOrgX = function(wox) {
          this.lworldOrgX = wox;
        };
        Transform.prototype.getWorldOrgY = function() {
          return this.lworldOrgY;
        };
        Transform.prototype.setWorldOrgY = function(woy) {
          this.lworldOrgY = woy;
        };
        Transform.prototype.getWorldExtX = function() {
          return this.lworldExtX;
        };
        Transform.prototype.setWorldExtX = function(wex) {
          this.lworldExtX = wex;
        };
        Transform.prototype.getWorldExtY = function() {
          return this.lworldExtY;
        };
        Transform.prototype.setWorldExtY = function(wey) {
          this.lworldExtY = wey;
        };
        Transform.prototype.getDeviceOrgX = function() {
          return this.ldeviceOrgX;
        };
        Transform.prototype.setDeviceOrgX = function(dox) {
          this.ldeviceOrgX = dox;
        };
        Transform.prototype.getDeviceOrgY = function() {
          return this.ldeviceOrgY;
        };
        Transform.prototype.setDeviceOrgY = function(doy) {
          this.ldeviceOrgY = doy;
        };
        Transform.prototype.getDeviceExtX = function() {
          return this.ldeviceExtX;
        };
        Transform.prototype.setDeviceExtX = function(dex) {
          this.ldeviceExtX = dex;
        };
        Transform.prototype.getDeviceExtY = function() {
          return this.ldeviceExtY;
        };
        Transform.prototype.setDeviceExtY = function(dey) {
          this.ldeviceExtY = dey;
        };
        Transform.prototype.transformX = function(x) {
          var xDevice = 0;
          var worldExtX = this.lworldExtX;
          if (worldExtX != 0) {
            xDevice = this.ldeviceOrgX + (x - this.lworldOrgX) * this.ldeviceExtX / worldExtX;
          }
          return xDevice;
        };
        Transform.prototype.transformY = function(y) {
          var yDevice = 0;
          var worldExtY = this.lworldExtY;
          if (worldExtY != 0) {
            yDevice = this.ldeviceOrgY + (y - this.lworldOrgY) * this.ldeviceExtY / worldExtY;
          }
          return yDevice;
        };
        Transform.prototype.inverseTransformX = function(x) {
          var xWorld = 0;
          var deviceExtX = this.ldeviceExtX;
          if (deviceExtX != 0) {
            xWorld = this.lworldOrgX + (x - this.ldeviceOrgX) * this.lworldExtX / deviceExtX;
          }
          return xWorld;
        };
        Transform.prototype.inverseTransformY = function(y) {
          var yWorld = 0;
          var deviceExtY = this.ldeviceExtY;
          if (deviceExtY != 0) {
            yWorld = this.lworldOrgY + (y - this.ldeviceOrgY) * this.lworldExtY / deviceExtY;
          }
          return yWorld;
        };
        Transform.prototype.inverseTransformPoint = function(inPoint) {
          var outPoint = new PointD(this.inverseTransformX(inPoint.x), this.inverseTransformY(inPoint.y));
          return outPoint;
        };
        module2.exports = Transform;
      },
      function(module2, exports2, __webpack_require__) {
        function _toConsumableArray(arr) {
          if (Array.isArray(arr)) {
            for (var i = 0, arr2 = Array(arr.length);i < arr.length; i++) {
              arr2[i] = arr[i];
            }
            return arr2;
          } else {
            return Array.from(arr);
          }
        }
        var Layout2 = __webpack_require__(15);
        var FDLayoutConstants = __webpack_require__(7);
        var LayoutConstants = __webpack_require__(0);
        var IGeometry = __webpack_require__(8);
        var IMath = __webpack_require__(9);
        function FDLayout() {
          Layout2.call(this);
          this.useSmartIdealEdgeLengthCalculation = FDLayoutConstants.DEFAULT_USE_SMART_IDEAL_EDGE_LENGTH_CALCULATION;
          this.idealEdgeLength = FDLayoutConstants.DEFAULT_EDGE_LENGTH;
          this.springConstant = FDLayoutConstants.DEFAULT_SPRING_STRENGTH;
          this.repulsionConstant = FDLayoutConstants.DEFAULT_REPULSION_STRENGTH;
          this.gravityConstant = FDLayoutConstants.DEFAULT_GRAVITY_STRENGTH;
          this.compoundGravityConstant = FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_STRENGTH;
          this.gravityRangeFactor = FDLayoutConstants.DEFAULT_GRAVITY_RANGE_FACTOR;
          this.compoundGravityRangeFactor = FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR;
          this.displacementThresholdPerNode = 3 * FDLayoutConstants.DEFAULT_EDGE_LENGTH / 100;
          this.coolingFactor = FDLayoutConstants.DEFAULT_COOLING_FACTOR_INCREMENTAL;
          this.initialCoolingFactor = FDLayoutConstants.DEFAULT_COOLING_FACTOR_INCREMENTAL;
          this.totalDisplacement = 0;
          this.oldTotalDisplacement = 0;
          this.maxIterations = FDLayoutConstants.MAX_ITERATIONS;
        }
        FDLayout.prototype = Object.create(Layout2.prototype);
        for (var prop in Layout2) {
          FDLayout[prop] = Layout2[prop];
        }
        FDLayout.prototype.initParameters = function() {
          Layout2.prototype.initParameters.call(this, arguments);
          this.totalIterations = 0;
          this.notAnimatedIterations = 0;
          this.useFRGridVariant = FDLayoutConstants.DEFAULT_USE_SMART_REPULSION_RANGE_CALCULATION;
          this.grid = [];
        };
        FDLayout.prototype.calcIdealEdgeLengths = function() {
          var edge;
          var lcaDepth;
          var source;
          var target;
          var sizeOfSourceInLca;
          var sizeOfTargetInLca;
          var allEdges = this.getGraphManager().getAllEdges();
          for (var i = 0;i < allEdges.length; i++) {
            edge = allEdges[i];
            edge.idealLength = this.idealEdgeLength;
            if (edge.isInterGraph) {
              source = edge.getSource();
              target = edge.getTarget();
              sizeOfSourceInLca = edge.getSourceInLca().getEstimatedSize();
              sizeOfTargetInLca = edge.getTargetInLca().getEstimatedSize();
              if (this.useSmartIdealEdgeLengthCalculation) {
                edge.idealLength += sizeOfSourceInLca + sizeOfTargetInLca - 2 * LayoutConstants.SIMPLE_NODE_SIZE;
              }
              lcaDepth = edge.getLca().getInclusionTreeDepth();
              edge.idealLength += FDLayoutConstants.DEFAULT_EDGE_LENGTH * FDLayoutConstants.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR * (source.getInclusionTreeDepth() + target.getInclusionTreeDepth() - 2 * lcaDepth);
            }
          }
        };
        FDLayout.prototype.initSpringEmbedder = function() {
          var s = this.getAllNodes().length;
          if (this.incremental) {
            if (s > FDLayoutConstants.ADAPTATION_LOWER_NODE_LIMIT) {
              this.coolingFactor = Math.max(this.coolingFactor * FDLayoutConstants.COOLING_ADAPTATION_FACTOR, this.coolingFactor - (s - FDLayoutConstants.ADAPTATION_LOWER_NODE_LIMIT) / (FDLayoutConstants.ADAPTATION_UPPER_NODE_LIMIT - FDLayoutConstants.ADAPTATION_LOWER_NODE_LIMIT) * this.coolingFactor * (1 - FDLayoutConstants.COOLING_ADAPTATION_FACTOR));
            }
            this.maxNodeDisplacement = FDLayoutConstants.MAX_NODE_DISPLACEMENT_INCREMENTAL;
          } else {
            if (s > FDLayoutConstants.ADAPTATION_LOWER_NODE_LIMIT) {
              this.coolingFactor = Math.max(FDLayoutConstants.COOLING_ADAPTATION_FACTOR, 1 - (s - FDLayoutConstants.ADAPTATION_LOWER_NODE_LIMIT) / (FDLayoutConstants.ADAPTATION_UPPER_NODE_LIMIT - FDLayoutConstants.ADAPTATION_LOWER_NODE_LIMIT) * (1 - FDLayoutConstants.COOLING_ADAPTATION_FACTOR));
            } else {
              this.coolingFactor = 1;
            }
            this.initialCoolingFactor = this.coolingFactor;
            this.maxNodeDisplacement = FDLayoutConstants.MAX_NODE_DISPLACEMENT;
          }
          this.maxIterations = Math.max(this.getAllNodes().length * 5, this.maxIterations);
          this.totalDisplacementThreshold = this.displacementThresholdPerNode * this.getAllNodes().length;
          this.repulsionRange = this.calcRepulsionRange();
        };
        FDLayout.prototype.calcSpringForces = function() {
          var lEdges = this.getAllEdges();
          var edge;
          for (var i = 0;i < lEdges.length; i++) {
            edge = lEdges[i];
            this.calcSpringForce(edge, edge.idealLength);
          }
        };
        FDLayout.prototype.calcRepulsionForces = function() {
          var gridUpdateAllowed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
          var forceToNodeSurroundingUpdate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
          var i, j;
          var nodeA, nodeB;
          var lNodes = this.getAllNodes();
          var processedNodeSet;
          if (this.useFRGridVariant) {
            if (this.totalIterations % FDLayoutConstants.GRID_CALCULATION_CHECK_PERIOD == 1 && gridUpdateAllowed) {
              this.updateGrid();
            }
            processedNodeSet = new Set;
            for (i = 0;i < lNodes.length; i++) {
              nodeA = lNodes[i];
              this.calculateRepulsionForceOfANode(nodeA, processedNodeSet, gridUpdateAllowed, forceToNodeSurroundingUpdate);
              processedNodeSet.add(nodeA);
            }
          } else {
            for (i = 0;i < lNodes.length; i++) {
              nodeA = lNodes[i];
              for (j = i + 1;j < lNodes.length; j++) {
                nodeB = lNodes[j];
                if (nodeA.getOwner() != nodeB.getOwner()) {
                  continue;
                }
                this.calcRepulsionForce(nodeA, nodeB);
              }
            }
          }
        };
        FDLayout.prototype.calcGravitationalForces = function() {
          var node;
          var lNodes = this.getAllNodesToApplyGravitation();
          for (var i = 0;i < lNodes.length; i++) {
            node = lNodes[i];
            this.calcGravitationalForce(node);
          }
        };
        FDLayout.prototype.moveNodes = function() {
          var lNodes = this.getAllNodes();
          var node;
          for (var i = 0;i < lNodes.length; i++) {
            node = lNodes[i];
            node.move();
          }
        };
        FDLayout.prototype.calcSpringForce = function(edge, idealLength) {
          var sourceNode = edge.getSource();
          var targetNode = edge.getTarget();
          var length;
          var springForce;
          var springForceX;
          var springForceY;
          if (this.uniformLeafNodeSizes && sourceNode.getChild() == null && targetNode.getChild() == null) {
            edge.updateLengthSimple();
          } else {
            edge.updateLength();
            if (edge.isOverlapingSourceAndTarget) {
              return;
            }
          }
          length = edge.getLength();
          if (length == 0)
            return;
          springForce = this.springConstant * (length - idealLength);
          springForceX = springForce * (edge.lengthX / length);
          springForceY = springForce * (edge.lengthY / length);
          sourceNode.springForceX += springForceX;
          sourceNode.springForceY += springForceY;
          targetNode.springForceX -= springForceX;
          targetNode.springForceY -= springForceY;
        };
        FDLayout.prototype.calcRepulsionForce = function(nodeA, nodeB) {
          var rectA = nodeA.getRect();
          var rectB = nodeB.getRect();
          var overlapAmount = new Array(2);
          var clipPoints = new Array(4);
          var distanceX;
          var distanceY;
          var distanceSquared;
          var distance;
          var repulsionForce;
          var repulsionForceX;
          var repulsionForceY;
          if (rectA.intersects(rectB)) {
            IGeometry.calcSeparationAmount(rectA, rectB, overlapAmount, FDLayoutConstants.DEFAULT_EDGE_LENGTH / 2);
            repulsionForceX = 2 * overlapAmount[0];
            repulsionForceY = 2 * overlapAmount[1];
            var childrenConstant = nodeA.noOfChildren * nodeB.noOfChildren / (nodeA.noOfChildren + nodeB.noOfChildren);
            nodeA.repulsionForceX -= childrenConstant * repulsionForceX;
            nodeA.repulsionForceY -= childrenConstant * repulsionForceY;
            nodeB.repulsionForceX += childrenConstant * repulsionForceX;
            nodeB.repulsionForceY += childrenConstant * repulsionForceY;
          } else {
            if (this.uniformLeafNodeSizes && nodeA.getChild() == null && nodeB.getChild() == null) {
              distanceX = rectB.getCenterX() - rectA.getCenterX();
              distanceY = rectB.getCenterY() - rectA.getCenterY();
            } else {
              IGeometry.getIntersection(rectA, rectB, clipPoints);
              distanceX = clipPoints[2] - clipPoints[0];
              distanceY = clipPoints[3] - clipPoints[1];
            }
            if (Math.abs(distanceX) < FDLayoutConstants.MIN_REPULSION_DIST) {
              distanceX = IMath.sign(distanceX) * FDLayoutConstants.MIN_REPULSION_DIST;
            }
            if (Math.abs(distanceY) < FDLayoutConstants.MIN_REPULSION_DIST) {
              distanceY = IMath.sign(distanceY) * FDLayoutConstants.MIN_REPULSION_DIST;
            }
            distanceSquared = distanceX * distanceX + distanceY * distanceY;
            distance = Math.sqrt(distanceSquared);
            repulsionForce = this.repulsionConstant * nodeA.noOfChildren * nodeB.noOfChildren / distanceSquared;
            repulsionForceX = repulsionForce * distanceX / distance;
            repulsionForceY = repulsionForce * distanceY / distance;
            nodeA.repulsionForceX -= repulsionForceX;
            nodeA.repulsionForceY -= repulsionForceY;
            nodeB.repulsionForceX += repulsionForceX;
            nodeB.repulsionForceY += repulsionForceY;
          }
        };
        FDLayout.prototype.calcGravitationalForce = function(node) {
          var ownerGraph;
          var ownerCenterX;
          var ownerCenterY;
          var distanceX;
          var distanceY;
          var absDistanceX;
          var absDistanceY;
          var estimatedSize;
          ownerGraph = node.getOwner();
          ownerCenterX = (ownerGraph.getRight() + ownerGraph.getLeft()) / 2;
          ownerCenterY = (ownerGraph.getTop() + ownerGraph.getBottom()) / 2;
          distanceX = node.getCenterX() - ownerCenterX;
          distanceY = node.getCenterY() - ownerCenterY;
          absDistanceX = Math.abs(distanceX) + node.getWidth() / 2;
          absDistanceY = Math.abs(distanceY) + node.getHeight() / 2;
          if (node.getOwner() == this.graphManager.getRoot()) {
            estimatedSize = ownerGraph.getEstimatedSize() * this.gravityRangeFactor;
            if (absDistanceX > estimatedSize || absDistanceY > estimatedSize) {
              node.gravitationForceX = -this.gravityConstant * distanceX;
              node.gravitationForceY = -this.gravityConstant * distanceY;
            }
          } else {
            estimatedSize = ownerGraph.getEstimatedSize() * this.compoundGravityRangeFactor;
            if (absDistanceX > estimatedSize || absDistanceY > estimatedSize) {
              node.gravitationForceX = -this.gravityConstant * distanceX * this.compoundGravityConstant;
              node.gravitationForceY = -this.gravityConstant * distanceY * this.compoundGravityConstant;
            }
          }
        };
        FDLayout.prototype.isConverged = function() {
          var converged;
          var oscilating = false;
          if (this.totalIterations > this.maxIterations / 3) {
            oscilating = Math.abs(this.totalDisplacement - this.oldTotalDisplacement) < 2;
          }
          converged = this.totalDisplacement < this.totalDisplacementThreshold;
          this.oldTotalDisplacement = this.totalDisplacement;
          return converged || oscilating;
        };
        FDLayout.prototype.animate = function() {
          if (this.animationDuringLayout && !this.isSubLayout) {
            if (this.notAnimatedIterations == this.animationPeriod) {
              this.update();
              this.notAnimatedIterations = 0;
            } else {
              this.notAnimatedIterations++;
            }
          }
        };
        FDLayout.prototype.calcNoOfChildrenForAllNodes = function() {
          var node;
          var allNodes = this.graphManager.getAllNodes();
          for (var i = 0;i < allNodes.length; i++) {
            node = allNodes[i];
            node.noOfChildren = node.getNoOfChildren();
          }
        };
        FDLayout.prototype.calcGrid = function(graph) {
          var sizeX = 0;
          var sizeY = 0;
          sizeX = parseInt(Math.ceil((graph.getRight() - graph.getLeft()) / this.repulsionRange));
          sizeY = parseInt(Math.ceil((graph.getBottom() - graph.getTop()) / this.repulsionRange));
          var grid = new Array(sizeX);
          for (var i = 0;i < sizeX; i++) {
            grid[i] = new Array(sizeY);
          }
          for (var i = 0;i < sizeX; i++) {
            for (var j = 0;j < sizeY; j++) {
              grid[i][j] = new Array;
            }
          }
          return grid;
        };
        FDLayout.prototype.addNodeToGrid = function(v, left, top) {
          var startX = 0;
          var finishX = 0;
          var startY = 0;
          var finishY = 0;
          startX = parseInt(Math.floor((v.getRect().x - left) / this.repulsionRange));
          finishX = parseInt(Math.floor((v.getRect().width + v.getRect().x - left) / this.repulsionRange));
          startY = parseInt(Math.floor((v.getRect().y - top) / this.repulsionRange));
          finishY = parseInt(Math.floor((v.getRect().height + v.getRect().y - top) / this.repulsionRange));
          for (var i = startX;i <= finishX; i++) {
            for (var j = startY;j <= finishY; j++) {
              this.grid[i][j].push(v);
              v.setGridCoordinates(startX, finishX, startY, finishY);
            }
          }
        };
        FDLayout.prototype.updateGrid = function() {
          var i;
          var nodeA;
          var lNodes = this.getAllNodes();
          this.grid = this.calcGrid(this.graphManager.getRoot());
          for (i = 0;i < lNodes.length; i++) {
            nodeA = lNodes[i];
            this.addNodeToGrid(nodeA, this.graphManager.getRoot().getLeft(), this.graphManager.getRoot().getTop());
          }
        };
        FDLayout.prototype.calculateRepulsionForceOfANode = function(nodeA, processedNodeSet, gridUpdateAllowed, forceToNodeSurroundingUpdate) {
          if (this.totalIterations % FDLayoutConstants.GRID_CALCULATION_CHECK_PERIOD == 1 && gridUpdateAllowed || forceToNodeSurroundingUpdate) {
            var surrounding = new Set;
            nodeA.surrounding = new Array;
            var nodeB;
            var grid = this.grid;
            for (var i = nodeA.startX - 1;i < nodeA.finishX + 2; i++) {
              for (var j = nodeA.startY - 1;j < nodeA.finishY + 2; j++) {
                if (!(i < 0 || j < 0 || i >= grid.length || j >= grid[0].length)) {
                  for (var k = 0;k < grid[i][j].length; k++) {
                    nodeB = grid[i][j][k];
                    if (nodeA.getOwner() != nodeB.getOwner() || nodeA == nodeB) {
                      continue;
                    }
                    if (!processedNodeSet.has(nodeB) && !surrounding.has(nodeB)) {
                      var distanceX = Math.abs(nodeA.getCenterX() - nodeB.getCenterX()) - (nodeA.getWidth() / 2 + nodeB.getWidth() / 2);
                      var distanceY = Math.abs(nodeA.getCenterY() - nodeB.getCenterY()) - (nodeA.getHeight() / 2 + nodeB.getHeight() / 2);
                      if (distanceX <= this.repulsionRange && distanceY <= this.repulsionRange) {
                        surrounding.add(nodeB);
                      }
                    }
                  }
                }
              }
            }
            nodeA.surrounding = [].concat(_toConsumableArray(surrounding));
          }
          for (i = 0;i < nodeA.surrounding.length; i++) {
            this.calcRepulsionForce(nodeA, nodeA.surrounding[i]);
          }
        };
        FDLayout.prototype.calcRepulsionRange = function() {
          return 0;
        };
        module2.exports = FDLayout;
      },
      function(module2, exports2, __webpack_require__) {
        var LEdge = __webpack_require__(1);
        var FDLayoutConstants = __webpack_require__(7);
        function FDLayoutEdge(source, target, vEdge) {
          LEdge.call(this, source, target, vEdge);
          this.idealLength = FDLayoutConstants.DEFAULT_EDGE_LENGTH;
        }
        FDLayoutEdge.prototype = Object.create(LEdge.prototype);
        for (var prop in LEdge) {
          FDLayoutEdge[prop] = LEdge[prop];
        }
        module2.exports = FDLayoutEdge;
      },
      function(module2, exports2, __webpack_require__) {
        var LNode = __webpack_require__(3);
        function FDLayoutNode(gm, loc, size, vNode) {
          LNode.call(this, gm, loc, size, vNode);
          this.springForceX = 0;
          this.springForceY = 0;
          this.repulsionForceX = 0;
          this.repulsionForceY = 0;
          this.gravitationForceX = 0;
          this.gravitationForceY = 0;
          this.displacementX = 0;
          this.displacementY = 0;
          this.startX = 0;
          this.finishX = 0;
          this.startY = 0;
          this.finishY = 0;
          this.surrounding = [];
        }
        FDLayoutNode.prototype = Object.create(LNode.prototype);
        for (var prop in LNode) {
          FDLayoutNode[prop] = LNode[prop];
        }
        FDLayoutNode.prototype.setGridCoordinates = function(_startX, _finishX, _startY, _finishY) {
          this.startX = _startX;
          this.finishX = _finishX;
          this.startY = _startY;
          this.finishY = _finishY;
        };
        module2.exports = FDLayoutNode;
      },
      function(module2, exports2, __webpack_require__) {
        function DimensionD2(width, height) {
          this.width = 0;
          this.height = 0;
          if (width !== null && height !== null) {
            this.height = height;
            this.width = width;
          }
        }
        DimensionD2.prototype.getWidth = function() {
          return this.width;
        };
        DimensionD2.prototype.setWidth = function(width) {
          this.width = width;
        };
        DimensionD2.prototype.getHeight = function() {
          return this.height;
        };
        DimensionD2.prototype.setHeight = function(height) {
          this.height = height;
        };
        module2.exports = DimensionD2;
      },
      function(module2, exports2, __webpack_require__) {
        var UniqueIDGeneretor = __webpack_require__(14);
        function HashMap() {
          this.map = {};
          this.keys = [];
        }
        HashMap.prototype.put = function(key, value) {
          var theId = UniqueIDGeneretor.createID(key);
          if (!this.contains(theId)) {
            this.map[theId] = value;
            this.keys.push(key);
          }
        };
        HashMap.prototype.contains = function(key) {
          var theId = UniqueIDGeneretor.createID(key);
          return this.map[key] != null;
        };
        HashMap.prototype.get = function(key) {
          var theId = UniqueIDGeneretor.createID(key);
          return this.map[theId];
        };
        HashMap.prototype.keySet = function() {
          return this.keys;
        };
        module2.exports = HashMap;
      },
      function(module2, exports2, __webpack_require__) {
        var UniqueIDGeneretor = __webpack_require__(14);
        function HashSet() {
          this.set = {};
        }
        HashSet.prototype.add = function(obj) {
          var theId = UniqueIDGeneretor.createID(obj);
          if (!this.contains(theId))
            this.set[theId] = obj;
        };
        HashSet.prototype.remove = function(obj) {
          delete this.set[UniqueIDGeneretor.createID(obj)];
        };
        HashSet.prototype.clear = function() {
          this.set = {};
        };
        HashSet.prototype.contains = function(obj) {
          return this.set[UniqueIDGeneretor.createID(obj)] == obj;
        };
        HashSet.prototype.isEmpty = function() {
          return this.size() === 0;
        };
        HashSet.prototype.size = function() {
          return Object.keys(this.set).length;
        };
        HashSet.prototype.addAllTo = function(list) {
          var keys = Object.keys(this.set);
          var length = keys.length;
          for (var i = 0;i < length; i++) {
            list.push(this.set[keys[i]]);
          }
        };
        HashSet.prototype.size = function() {
          return Object.keys(this.set).length;
        };
        HashSet.prototype.addAll = function(list) {
          var s = list.length;
          for (var i = 0;i < s; i++) {
            var v = list[i];
            this.add(v);
          }
        };
        module2.exports = HashSet;
      },
      function(module2, exports2, __webpack_require__) {
        var _createClass = function() {
          function defineProperties(target, props) {
            for (var i = 0;i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || false;
              descriptor.configurable = true;
              if ("value" in descriptor)
                descriptor.writable = true;
              Object.defineProperty(target, descriptor.key, descriptor);
            }
          }
          return function(Constructor, protoProps, staticProps) {
            if (protoProps)
              defineProperties(Constructor.prototype, protoProps);
            if (staticProps)
              defineProperties(Constructor, staticProps);
            return Constructor;
          };
        }();
        function _classCallCheck(instance2, Constructor) {
          if (!(instance2 instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
          }
        }
        var LinkedList = __webpack_require__(11);
        var Quicksort = function() {
          function Quicksort2(A, compareFunction) {
            _classCallCheck(this, Quicksort2);
            if (compareFunction !== null || compareFunction !== undefined)
              this.compareFunction = this._defaultCompareFunction;
            var length = undefined;
            if (A instanceof LinkedList)
              length = A.size();
            else
              length = A.length;
            this._quicksort(A, 0, length - 1);
          }
          _createClass(Quicksort2, [{
            key: "_quicksort",
            value: function _quicksort(A, p, r) {
              if (p < r) {
                var q = this._partition(A, p, r);
                this._quicksort(A, p, q);
                this._quicksort(A, q + 1, r);
              }
            }
          }, {
            key: "_partition",
            value: function _partition(A, p, r) {
              var x = this._get(A, p);
              var i = p;
              var j = r;
              while (true) {
                while (this.compareFunction(x, this._get(A, j))) {
                  j--;
                }
                while (this.compareFunction(this._get(A, i), x)) {
                  i++;
                }
                if (i < j) {
                  this._swap(A, i, j);
                  i++;
                  j--;
                } else
                  return j;
              }
            }
          }, {
            key: "_get",
            value: function _get(object, index) {
              if (object instanceof LinkedList)
                return object.get_object_at(index);
              else
                return object[index];
            }
          }, {
            key: "_set",
            value: function _set(object, index, value) {
              if (object instanceof LinkedList)
                object.set_object_at(index, value);
              else
                object[index] = value;
            }
          }, {
            key: "_swap",
            value: function _swap(A, i, j) {
              var temp = this._get(A, i);
              this._set(A, i, this._get(A, j));
              this._set(A, j, temp);
            }
          }, {
            key: "_defaultCompareFunction",
            value: function _defaultCompareFunction(a, b) {
              return b > a;
            }
          }]);
          return Quicksort2;
        }();
        module2.exports = Quicksort;
      },
      function(module2, exports2, __webpack_require__) {
        var _createClass = function() {
          function defineProperties(target, props) {
            for (var i = 0;i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || false;
              descriptor.configurable = true;
              if ("value" in descriptor)
                descriptor.writable = true;
              Object.defineProperty(target, descriptor.key, descriptor);
            }
          }
          return function(Constructor, protoProps, staticProps) {
            if (protoProps)
              defineProperties(Constructor.prototype, protoProps);
            if (staticProps)
              defineProperties(Constructor, staticProps);
            return Constructor;
          };
        }();
        function _classCallCheck(instance2, Constructor) {
          if (!(instance2 instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
          }
        }
        var NeedlemanWunsch = function() {
          function NeedlemanWunsch2(sequence1, sequence2) {
            var match_score = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
            var mismatch_penalty = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : -1;
            var gap_penalty = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : -1;
            _classCallCheck(this, NeedlemanWunsch2);
            this.sequence1 = sequence1;
            this.sequence2 = sequence2;
            this.match_score = match_score;
            this.mismatch_penalty = mismatch_penalty;
            this.gap_penalty = gap_penalty;
            this.iMax = sequence1.length + 1;
            this.jMax = sequence2.length + 1;
            this.grid = new Array(this.iMax);
            for (var i = 0;i < this.iMax; i++) {
              this.grid[i] = new Array(this.jMax);
              for (var j = 0;j < this.jMax; j++) {
                this.grid[i][j] = 0;
              }
            }
            this.tracebackGrid = new Array(this.iMax);
            for (var _i = 0;_i < this.iMax; _i++) {
              this.tracebackGrid[_i] = new Array(this.jMax);
              for (var _j = 0;_j < this.jMax; _j++) {
                this.tracebackGrid[_i][_j] = [null, null, null];
              }
            }
            this.alignments = [];
            this.score = -1;
            this.computeGrids();
          }
          _createClass(NeedlemanWunsch2, [{
            key: "getScore",
            value: function getScore() {
              return this.score;
            }
          }, {
            key: "getAlignments",
            value: function getAlignments() {
              return this.alignments;
            }
          }, {
            key: "computeGrids",
            value: function computeGrids() {
              for (var j = 1;j < this.jMax; j++) {
                this.grid[0][j] = this.grid[0][j - 1] + this.gap_penalty;
                this.tracebackGrid[0][j] = [false, false, true];
              }
              for (var i = 1;i < this.iMax; i++) {
                this.grid[i][0] = this.grid[i - 1][0] + this.gap_penalty;
                this.tracebackGrid[i][0] = [false, true, false];
              }
              for (var _i2 = 1;_i2 < this.iMax; _i2++) {
                for (var _j2 = 1;_j2 < this.jMax; _j2++) {
                  var diag = undefined;
                  if (this.sequence1[_i2 - 1] === this.sequence2[_j2 - 1])
                    diag = this.grid[_i2 - 1][_j2 - 1] + this.match_score;
                  else
                    diag = this.grid[_i2 - 1][_j2 - 1] + this.mismatch_penalty;
                  var up = this.grid[_i2 - 1][_j2] + this.gap_penalty;
                  var left = this.grid[_i2][_j2 - 1] + this.gap_penalty;
                  var maxOf = [diag, up, left];
                  var indices = this.arrayAllMaxIndexes(maxOf);
                  this.grid[_i2][_j2] = maxOf[indices[0]];
                  this.tracebackGrid[_i2][_j2] = [indices.includes(0), indices.includes(1), indices.includes(2)];
                }
              }
              this.score = this.grid[this.iMax - 1][this.jMax - 1];
            }
          }, {
            key: "alignmentTraceback",
            value: function alignmentTraceback() {
              var inProcessAlignments = [];
              inProcessAlignments.push({
                pos: [this.sequence1.length, this.sequence2.length],
                seq1: "",
                seq2: ""
              });
              while (inProcessAlignments[0]) {
                var current = inProcessAlignments[0];
                var directions = this.tracebackGrid[current.pos[0]][current.pos[1]];
                if (directions[0]) {
                  inProcessAlignments.push({
                    pos: [current.pos[0] - 1, current.pos[1] - 1],
                    seq1: this.sequence1[current.pos[0] - 1] + current.seq1,
                    seq2: this.sequence2[current.pos[1] - 1] + current.seq2
                  });
                }
                if (directions[1]) {
                  inProcessAlignments.push({
                    pos: [current.pos[0] - 1, current.pos[1]],
                    seq1: this.sequence1[current.pos[0] - 1] + current.seq1,
                    seq2: "-" + current.seq2
                  });
                }
                if (directions[2]) {
                  inProcessAlignments.push({
                    pos: [current.pos[0], current.pos[1] - 1],
                    seq1: "-" + current.seq1,
                    seq2: this.sequence2[current.pos[1] - 1] + current.seq2
                  });
                }
                if (current.pos[0] === 0 && current.pos[1] === 0)
                  this.alignments.push({
                    sequence1: current.seq1,
                    sequence2: current.seq2
                  });
                inProcessAlignments.shift();
              }
              return this.alignments;
            }
          }, {
            key: "getAllIndexes",
            value: function getAllIndexes(arr, val) {
              var indexes = [], i = -1;
              while ((i = arr.indexOf(val, i + 1)) !== -1) {
                indexes.push(i);
              }
              return indexes;
            }
          }, {
            key: "arrayAllMaxIndexes",
            value: function arrayAllMaxIndexes(array) {
              return this.getAllIndexes(array, Math.max.apply(null, array));
            }
          }]);
          return NeedlemanWunsch2;
        }();
        module2.exports = NeedlemanWunsch;
      },
      function(module2, exports2, __webpack_require__) {
        var layoutBase = function layoutBase2() {
          return;
        };
        layoutBase.FDLayout = __webpack_require__(18);
        layoutBase.FDLayoutConstants = __webpack_require__(7);
        layoutBase.FDLayoutEdge = __webpack_require__(19);
        layoutBase.FDLayoutNode = __webpack_require__(20);
        layoutBase.DimensionD = __webpack_require__(21);
        layoutBase.HashMap = __webpack_require__(22);
        layoutBase.HashSet = __webpack_require__(23);
        layoutBase.IGeometry = __webpack_require__(8);
        layoutBase.IMath = __webpack_require__(9);
        layoutBase.Integer = __webpack_require__(10);
        layoutBase.Point = __webpack_require__(12);
        layoutBase.PointD = __webpack_require__(4);
        layoutBase.RandomSeed = __webpack_require__(16);
        layoutBase.RectangleD = __webpack_require__(13);
        layoutBase.Transform = __webpack_require__(17);
        layoutBase.UniqueIDGeneretor = __webpack_require__(14);
        layoutBase.Quicksort = __webpack_require__(24);
        layoutBase.LinkedList = __webpack_require__(11);
        layoutBase.LGraphObject = __webpack_require__(2);
        layoutBase.LGraph = __webpack_require__(5);
        layoutBase.LEdge = __webpack_require__(1);
        layoutBase.LGraphManager = __webpack_require__(6);
        layoutBase.LNode = __webpack_require__(3);
        layoutBase.Layout = __webpack_require__(15);
        layoutBase.LayoutConstants = __webpack_require__(0);
        layoutBase.NeedlemanWunsch = __webpack_require__(25);
        module2.exports = layoutBase;
      },
      function(module2, exports2, __webpack_require__) {
        function Emitter() {
          this.listeners = [];
        }
        var p = Emitter.prototype;
        p.addListener = function(event, callback) {
          this.listeners.push({
            event,
            callback
          });
        };
        p.removeListener = function(event, callback) {
          for (var i = this.listeners.length;i >= 0; i--) {
            var l = this.listeners[i];
            if (l.event === event && l.callback === callback) {
              this.listeners.splice(i, 1);
            }
          }
        };
        p.emit = function(event, data) {
          for (var i = 0;i < this.listeners.length; i++) {
            var l = this.listeners[i];
            if (event === l.event) {
              l.callback(data);
            }
          }
        };
        module2.exports = Emitter;
      }
    ]);
  });
});

// node_modules/cose-base/cose-base.js
var require_cose_base = __commonJS((exports, module) => {
  (function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === "object" && typeof module === "object")
      module.exports = factory(require_layout_base());
    else if (typeof define === "function" && define.amd)
      define(["layout-base"], factory);
    else if (typeof exports === "object")
      exports["coseBase"] = factory(require_layout_base());
    else
      root["coseBase"] = factory(root["layoutBase"]);
  })(exports, function(__WEBPACK_EXTERNAL_MODULE_0__) {
    return function(modules) {
      var installedModules = {};
      function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) {
          return installedModules[moduleId].exports;
        }
        var module2 = installedModules[moduleId] = {
          i: moduleId,
          l: false,
          exports: {}
        };
        modules[moduleId].call(module2.exports, module2, module2.exports, __webpack_require__);
        module2.l = true;
        return module2.exports;
      }
      __webpack_require__.m = modules;
      __webpack_require__.c = installedModules;
      __webpack_require__.i = function(value) {
        return value;
      };
      __webpack_require__.d = function(exports2, name, getter) {
        if (!__webpack_require__.o(exports2, name)) {
          Object.defineProperty(exports2, name, {
            configurable: false,
            enumerable: true,
            get: getter
          });
        }
      };
      __webpack_require__.n = function(module2) {
        var getter = module2 && module2.__esModule ? function getDefault() {
          return module2["default"];
        } : function getModuleExports() {
          return module2;
        };
        __webpack_require__.d(getter, "a", getter);
        return getter;
      };
      __webpack_require__.o = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
      };
      __webpack_require__.p = "";
      return __webpack_require__(__webpack_require__.s = 7);
    }([
      function(module2, exports2) {
        module2.exports = __WEBPACK_EXTERNAL_MODULE_0__;
      },
      function(module2, exports2, __webpack_require__) {
        var FDLayoutConstants = __webpack_require__(0).FDLayoutConstants;
        function CoSEConstants() {}
        for (var prop in FDLayoutConstants) {
          CoSEConstants[prop] = FDLayoutConstants[prop];
        }
        CoSEConstants.DEFAULT_USE_MULTI_LEVEL_SCALING = false;
        CoSEConstants.DEFAULT_RADIAL_SEPARATION = FDLayoutConstants.DEFAULT_EDGE_LENGTH;
        CoSEConstants.DEFAULT_COMPONENT_SEPERATION = 60;
        CoSEConstants.TILE = true;
        CoSEConstants.TILING_PADDING_VERTICAL = 10;
        CoSEConstants.TILING_PADDING_HORIZONTAL = 10;
        CoSEConstants.TREE_REDUCTION_ON_INCREMENTAL = false;
        module2.exports = CoSEConstants;
      },
      function(module2, exports2, __webpack_require__) {
        var FDLayoutEdge = __webpack_require__(0).FDLayoutEdge;
        function CoSEEdge(source, target, vEdge) {
          FDLayoutEdge.call(this, source, target, vEdge);
        }
        CoSEEdge.prototype = Object.create(FDLayoutEdge.prototype);
        for (var prop in FDLayoutEdge) {
          CoSEEdge[prop] = FDLayoutEdge[prop];
        }
        module2.exports = CoSEEdge;
      },
      function(module2, exports2, __webpack_require__) {
        var LGraph = __webpack_require__(0).LGraph;
        function CoSEGraph(parent, graphMgr, vGraph) {
          LGraph.call(this, parent, graphMgr, vGraph);
        }
        CoSEGraph.prototype = Object.create(LGraph.prototype);
        for (var prop in LGraph) {
          CoSEGraph[prop] = LGraph[prop];
        }
        module2.exports = CoSEGraph;
      },
      function(module2, exports2, __webpack_require__) {
        var LGraphManager = __webpack_require__(0).LGraphManager;
        function CoSEGraphManager(layout) {
          LGraphManager.call(this, layout);
        }
        CoSEGraphManager.prototype = Object.create(LGraphManager.prototype);
        for (var prop in LGraphManager) {
          CoSEGraphManager[prop] = LGraphManager[prop];
        }
        module2.exports = CoSEGraphManager;
      },
      function(module2, exports2, __webpack_require__) {
        var FDLayoutNode = __webpack_require__(0).FDLayoutNode;
        var IMath = __webpack_require__(0).IMath;
        function CoSENode(gm, loc, size, vNode) {
          FDLayoutNode.call(this, gm, loc, size, vNode);
        }
        CoSENode.prototype = Object.create(FDLayoutNode.prototype);
        for (var prop in FDLayoutNode) {
          CoSENode[prop] = FDLayoutNode[prop];
        }
        CoSENode.prototype.move = function() {
          var layout = this.graphManager.getLayout();
          this.displacementX = layout.coolingFactor * (this.springForceX + this.repulsionForceX + this.gravitationForceX) / this.noOfChildren;
          this.displacementY = layout.coolingFactor * (this.springForceY + this.repulsionForceY + this.gravitationForceY) / this.noOfChildren;
          if (Math.abs(this.displacementX) > layout.coolingFactor * layout.maxNodeDisplacement) {
            this.displacementX = layout.coolingFactor * layout.maxNodeDisplacement * IMath.sign(this.displacementX);
          }
          if (Math.abs(this.displacementY) > layout.coolingFactor * layout.maxNodeDisplacement) {
            this.displacementY = layout.coolingFactor * layout.maxNodeDisplacement * IMath.sign(this.displacementY);
          }
          if (this.child == null) {
            this.moveBy(this.displacementX, this.displacementY);
          } else if (this.child.getNodes().length == 0) {
            this.moveBy(this.displacementX, this.displacementY);
          } else {
            this.propogateDisplacementToChildren(this.displacementX, this.displacementY);
          }
          layout.totalDisplacement += Math.abs(this.displacementX) + Math.abs(this.displacementY);
          this.springForceX = 0;
          this.springForceY = 0;
          this.repulsionForceX = 0;
          this.repulsionForceY = 0;
          this.gravitationForceX = 0;
          this.gravitationForceY = 0;
          this.displacementX = 0;
          this.displacementY = 0;
        };
        CoSENode.prototype.propogateDisplacementToChildren = function(dX, dY) {
          var nodes = this.getChild().getNodes();
          var node;
          for (var i = 0;i < nodes.length; i++) {
            node = nodes[i];
            if (node.getChild() == null) {
              node.moveBy(dX, dY);
              node.displacementX += dX;
              node.displacementY += dY;
            } else {
              node.propogateDisplacementToChildren(dX, dY);
            }
          }
        };
        CoSENode.prototype.setPred1 = function(pred12) {
          this.pred1 = pred12;
        };
        CoSENode.prototype.getPred1 = function() {
          return pred1;
        };
        CoSENode.prototype.getPred2 = function() {
          return pred2;
        };
        CoSENode.prototype.setNext = function(next2) {
          this.next = next2;
        };
        CoSENode.prototype.getNext = function() {
          return next;
        };
        CoSENode.prototype.setProcessed = function(processed2) {
          this.processed = processed2;
        };
        CoSENode.prototype.isProcessed = function() {
          return processed;
        };
        module2.exports = CoSENode;
      },
      function(module2, exports2, __webpack_require__) {
        var FDLayout = __webpack_require__(0).FDLayout;
        var CoSEGraphManager = __webpack_require__(4);
        var CoSEGraph = __webpack_require__(3);
        var CoSENode = __webpack_require__(5);
        var CoSEEdge = __webpack_require__(2);
        var CoSEConstants = __webpack_require__(1);
        var FDLayoutConstants = __webpack_require__(0).FDLayoutConstants;
        var LayoutConstants = __webpack_require__(0).LayoutConstants;
        var Point2 = __webpack_require__(0).Point;
        var PointD = __webpack_require__(0).PointD;
        var Layout2 = __webpack_require__(0).Layout;
        var Integer = __webpack_require__(0).Integer;
        var IGeometry = __webpack_require__(0).IGeometry;
        var LGraph = __webpack_require__(0).LGraph;
        var Transform = __webpack_require__(0).Transform;
        function CoSELayout() {
          FDLayout.call(this);
          this.toBeTiled = {};
        }
        CoSELayout.prototype = Object.create(FDLayout.prototype);
        for (var prop in FDLayout) {
          CoSELayout[prop] = FDLayout[prop];
        }
        CoSELayout.prototype.newGraphManager = function() {
          var gm = new CoSEGraphManager(this);
          this.graphManager = gm;
          return gm;
        };
        CoSELayout.prototype.newGraph = function(vGraph) {
          return new CoSEGraph(null, this.graphManager, vGraph);
        };
        CoSELayout.prototype.newNode = function(vNode) {
          return new CoSENode(this.graphManager, vNode);
        };
        CoSELayout.prototype.newEdge = function(vEdge) {
          return new CoSEEdge(null, null, vEdge);
        };
        CoSELayout.prototype.initParameters = function() {
          FDLayout.prototype.initParameters.call(this, arguments);
          if (!this.isSubLayout) {
            if (CoSEConstants.DEFAULT_EDGE_LENGTH < 10) {
              this.idealEdgeLength = 10;
            } else {
              this.idealEdgeLength = CoSEConstants.DEFAULT_EDGE_LENGTH;
            }
            this.useSmartIdealEdgeLengthCalculation = CoSEConstants.DEFAULT_USE_SMART_IDEAL_EDGE_LENGTH_CALCULATION;
            this.springConstant = FDLayoutConstants.DEFAULT_SPRING_STRENGTH;
            this.repulsionConstant = FDLayoutConstants.DEFAULT_REPULSION_STRENGTH;
            this.gravityConstant = FDLayoutConstants.DEFAULT_GRAVITY_STRENGTH;
            this.compoundGravityConstant = FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_STRENGTH;
            this.gravityRangeFactor = FDLayoutConstants.DEFAULT_GRAVITY_RANGE_FACTOR;
            this.compoundGravityRangeFactor = FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR;
            this.prunedNodesAll = [];
            this.growTreeIterations = 0;
            this.afterGrowthIterations = 0;
            this.isTreeGrowing = false;
            this.isGrowthFinished = false;
            this.coolingCycle = 0;
            this.maxCoolingCycle = this.maxIterations / FDLayoutConstants.CONVERGENCE_CHECK_PERIOD;
            this.finalTemperature = FDLayoutConstants.CONVERGENCE_CHECK_PERIOD / this.maxIterations;
            this.coolingAdjuster = 1;
          }
        };
        CoSELayout.prototype.layout = function() {
          var createBendsAsNeeded = LayoutConstants.DEFAULT_CREATE_BENDS_AS_NEEDED;
          if (createBendsAsNeeded) {
            this.createBendpoints();
            this.graphManager.resetAllEdges();
          }
          this.level = 0;
          return this.classicLayout();
        };
        CoSELayout.prototype.classicLayout = function() {
          this.nodesWithGravity = this.calculateNodesToApplyGravitationTo();
          this.graphManager.setAllNodesToApplyGravitation(this.nodesWithGravity);
          this.calcNoOfChildrenForAllNodes();
          this.graphManager.calcLowestCommonAncestors();
          this.graphManager.calcInclusionTreeDepths();
          this.graphManager.getRoot().calcEstimatedSize();
          this.calcIdealEdgeLengths();
          if (!this.incremental) {
            var forest = this.getFlatForest();
            if (forest.length > 0) {
              this.positionNodesRadially(forest);
            } else {
              this.reduceTrees();
              this.graphManager.resetAllNodesToApplyGravitation();
              var allNodes = new Set(this.getAllNodes());
              var intersection = this.nodesWithGravity.filter(function(x) {
                return allNodes.has(x);
              });
              this.graphManager.setAllNodesToApplyGravitation(intersection);
              this.positionNodesRandomly();
            }
          } else {
            if (CoSEConstants.TREE_REDUCTION_ON_INCREMENTAL) {
              this.reduceTrees();
              this.graphManager.resetAllNodesToApplyGravitation();
              var allNodes = new Set(this.getAllNodes());
              var intersection = this.nodesWithGravity.filter(function(x) {
                return allNodes.has(x);
              });
              this.graphManager.setAllNodesToApplyGravitation(intersection);
            }
          }
          this.initSpringEmbedder();
          this.runSpringEmbedder();
          return true;
        };
        CoSELayout.prototype.tick = function() {
          this.totalIterations++;
          if (this.totalIterations === this.maxIterations && !this.isTreeGrowing && !this.isGrowthFinished) {
            if (this.prunedNodesAll.length > 0) {
              this.isTreeGrowing = true;
            } else {
              return true;
            }
          }
          if (this.totalIterations % FDLayoutConstants.CONVERGENCE_CHECK_PERIOD == 0 && !this.isTreeGrowing && !this.isGrowthFinished) {
            if (this.isConverged()) {
              if (this.prunedNodesAll.length > 0) {
                this.isTreeGrowing = true;
              } else {
                return true;
              }
            }
            this.coolingCycle++;
            if (this.layoutQuality == 0) {
              this.coolingAdjuster = this.coolingCycle;
            } else if (this.layoutQuality == 1) {
              this.coolingAdjuster = this.coolingCycle / 3;
            }
            this.coolingFactor = Math.max(this.initialCoolingFactor - Math.pow(this.coolingCycle, Math.log(100 * (this.initialCoolingFactor - this.finalTemperature)) / Math.log(this.maxCoolingCycle)) / 100 * this.coolingAdjuster, this.finalTemperature);
            this.animationPeriod = Math.ceil(this.initialAnimationPeriod * Math.sqrt(this.coolingFactor));
          }
          if (this.isTreeGrowing) {
            if (this.growTreeIterations % 10 == 0) {
              if (this.prunedNodesAll.length > 0) {
                this.graphManager.updateBounds();
                this.updateGrid();
                this.growTree(this.prunedNodesAll);
                this.graphManager.resetAllNodesToApplyGravitation();
                var allNodes = new Set(this.getAllNodes());
                var intersection = this.nodesWithGravity.filter(function(x) {
                  return allNodes.has(x);
                });
                this.graphManager.setAllNodesToApplyGravitation(intersection);
                this.graphManager.updateBounds();
                this.updateGrid();
                this.coolingFactor = FDLayoutConstants.DEFAULT_COOLING_FACTOR_INCREMENTAL;
              } else {
                this.isTreeGrowing = false;
                this.isGrowthFinished = true;
              }
            }
            this.growTreeIterations++;
          }
          if (this.isGrowthFinished) {
            if (this.isConverged()) {
              return true;
            }
            if (this.afterGrowthIterations % 10 == 0) {
              this.graphManager.updateBounds();
              this.updateGrid();
            }
            this.coolingFactor = FDLayoutConstants.DEFAULT_COOLING_FACTOR_INCREMENTAL * ((100 - this.afterGrowthIterations) / 100);
            this.afterGrowthIterations++;
          }
          var gridUpdateAllowed = !this.isTreeGrowing && !this.isGrowthFinished;
          var forceToNodeSurroundingUpdate = this.growTreeIterations % 10 == 1 && this.isTreeGrowing || this.afterGrowthIterations % 10 == 1 && this.isGrowthFinished;
          this.totalDisplacement = 0;
          this.graphManager.updateBounds();
          this.calcSpringForces();
          this.calcRepulsionForces(gridUpdateAllowed, forceToNodeSurroundingUpdate);
          this.calcGravitationalForces();
          this.moveNodes();
          this.animate();
          return false;
        };
        CoSELayout.prototype.getPositionsData = function() {
          var allNodes = this.graphManager.getAllNodes();
          var pData = {};
          for (var i = 0;i < allNodes.length; i++) {
            var rect = allNodes[i].rect;
            var id = allNodes[i].id;
            pData[id] = {
              id,
              x: rect.getCenterX(),
              y: rect.getCenterY(),
              w: rect.width,
              h: rect.height
            };
          }
          return pData;
        };
        CoSELayout.prototype.runSpringEmbedder = function() {
          this.initialAnimationPeriod = 25;
          this.animationPeriod = this.initialAnimationPeriod;
          var layoutEnded = false;
          if (FDLayoutConstants.ANIMATE === "during") {
            this.emit("layoutstarted");
          } else {
            while (!layoutEnded) {
              layoutEnded = this.tick();
            }
            this.graphManager.updateBounds();
          }
        };
        CoSELayout.prototype.calculateNodesToApplyGravitationTo = function() {
          var nodeList = [];
          var graph;
          var graphs = this.graphManager.getGraphs();
          var size = graphs.length;
          var i;
          for (i = 0;i < size; i++) {
            graph = graphs[i];
            graph.updateConnected();
            if (!graph.isConnected) {
              nodeList = nodeList.concat(graph.getNodes());
            }
          }
          return nodeList;
        };
        CoSELayout.prototype.createBendpoints = function() {
          var edges = [];
          edges = edges.concat(this.graphManager.getAllEdges());
          var visited = new Set;
          var i;
          for (i = 0;i < edges.length; i++) {
            var edge = edges[i];
            if (!visited.has(edge)) {
              var source = edge.getSource();
              var target = edge.getTarget();
              if (source == target) {
                edge.getBendpoints().push(new PointD);
                edge.getBendpoints().push(new PointD);
                this.createDummyNodesForBendpoints(edge);
                visited.add(edge);
              } else {
                var edgeList = [];
                edgeList = edgeList.concat(source.getEdgeListToNode(target));
                edgeList = edgeList.concat(target.getEdgeListToNode(source));
                if (!visited.has(edgeList[0])) {
                  if (edgeList.length > 1) {
                    var k;
                    for (k = 0;k < edgeList.length; k++) {
                      var multiEdge = edgeList[k];
                      multiEdge.getBendpoints().push(new PointD);
                      this.createDummyNodesForBendpoints(multiEdge);
                    }
                  }
                  edgeList.forEach(function(edge2) {
                    visited.add(edge2);
                  });
                }
              }
            }
            if (visited.size == edges.length) {
              break;
            }
          }
        };
        CoSELayout.prototype.positionNodesRadially = function(forest) {
          var currentStartingPoint = new Point2(0, 0);
          var numberOfColumns = Math.ceil(Math.sqrt(forest.length));
          var height = 0;
          var currentY = 0;
          var currentX = 0;
          var point = new PointD(0, 0);
          for (var i = 0;i < forest.length; i++) {
            if (i % numberOfColumns == 0) {
              currentX = 0;
              currentY = height;
              if (i != 0) {
                currentY += CoSEConstants.DEFAULT_COMPONENT_SEPERATION;
              }
              height = 0;
            }
            var tree = forest[i];
            var centerNode = Layout2.findCenterOfTree(tree);
            currentStartingPoint.x = currentX;
            currentStartingPoint.y = currentY;
            point = CoSELayout.radialLayout(tree, centerNode, currentStartingPoint);
            if (point.y > height) {
              height = Math.floor(point.y);
            }
            currentX = Math.floor(point.x + CoSEConstants.DEFAULT_COMPONENT_SEPERATION);
          }
          this.transform(new PointD(LayoutConstants.WORLD_CENTER_X - point.x / 2, LayoutConstants.WORLD_CENTER_Y - point.y / 2));
        };
        CoSELayout.radialLayout = function(tree, centerNode, startingPoint) {
          var radialSep = Math.max(this.maxDiagonalInTree(tree), CoSEConstants.DEFAULT_RADIAL_SEPARATION);
          CoSELayout.branchRadialLayout(centerNode, null, 0, 359, 0, radialSep);
          var bounds = LGraph.calculateBounds(tree);
          var transform = new Transform;
          transform.setDeviceOrgX(bounds.getMinX());
          transform.setDeviceOrgY(bounds.getMinY());
          transform.setWorldOrgX(startingPoint.x);
          transform.setWorldOrgY(startingPoint.y);
          for (var i = 0;i < tree.length; i++) {
            var node = tree[i];
            node.transform(transform);
          }
          var bottomRight = new PointD(bounds.getMaxX(), bounds.getMaxY());
          return transform.inverseTransformPoint(bottomRight);
        };
        CoSELayout.branchRadialLayout = function(node, parentOfNode, startAngle, endAngle, distance, radialSeparation) {
          var halfInterval = (endAngle - startAngle + 1) / 2;
          if (halfInterval < 0) {
            halfInterval += 180;
          }
          var nodeAngle = (halfInterval + startAngle) % 360;
          var teta = nodeAngle * IGeometry.TWO_PI / 360;
          var cos_teta = Math.cos(teta);
          var x_ = distance * Math.cos(teta);
          var y_ = distance * Math.sin(teta);
          node.setCenter(x_, y_);
          var neighborEdges = [];
          neighborEdges = neighborEdges.concat(node.getEdges());
          var childCount = neighborEdges.length;
          if (parentOfNode != null) {
            childCount--;
          }
          var branchCount = 0;
          var incEdgesCount = neighborEdges.length;
          var startIndex;
          var edges = node.getEdgesBetween(parentOfNode);
          while (edges.length > 1) {
            var temp = edges[0];
            edges.splice(0, 1);
            var index = neighborEdges.indexOf(temp);
            if (index >= 0) {
              neighborEdges.splice(index, 1);
            }
            incEdgesCount--;
            childCount--;
          }
          if (parentOfNode != null) {
            startIndex = (neighborEdges.indexOf(edges[0]) + 1) % incEdgesCount;
          } else {
            startIndex = 0;
          }
          var stepAngle = Math.abs(endAngle - startAngle) / childCount;
          for (var i = startIndex;branchCount != childCount; i = ++i % incEdgesCount) {
            var currentNeighbor = neighborEdges[i].getOtherEnd(node);
            if (currentNeighbor == parentOfNode) {
              continue;
            }
            var childStartAngle = (startAngle + branchCount * stepAngle) % 360;
            var childEndAngle = (childStartAngle + stepAngle) % 360;
            CoSELayout.branchRadialLayout(currentNeighbor, node, childStartAngle, childEndAngle, distance + radialSeparation, radialSeparation);
            branchCount++;
          }
        };
        CoSELayout.maxDiagonalInTree = function(tree) {
          var maxDiagonal = Integer.MIN_VALUE;
          for (var i = 0;i < tree.length; i++) {
            var node = tree[i];
            var diagonal = node.getDiagonal();
            if (diagonal > maxDiagonal) {
              maxDiagonal = diagonal;
            }
          }
          return maxDiagonal;
        };
        CoSELayout.prototype.calcRepulsionRange = function() {
          return 2 * (this.level + 1) * this.idealEdgeLength;
        };
        CoSELayout.prototype.groupZeroDegreeMembers = function() {
          var self = this;
          var tempMemberGroups = {};
          this.memberGroups = {};
          this.idToDummyNode = {};
          var zeroDegree = [];
          var allNodes = this.graphManager.getAllNodes();
          for (var i = 0;i < allNodes.length; i++) {
            var node = allNodes[i];
            var parent = node.getParent();
            if (this.getNodeDegreeWithChildren(node) === 0 && (parent.id == undefined || !this.getToBeTiled(parent))) {
              zeroDegree.push(node);
            }
          }
          for (var i = 0;i < zeroDegree.length; i++) {
            var node = zeroDegree[i];
            var p_id = node.getParent().id;
            if (typeof tempMemberGroups[p_id] === "undefined")
              tempMemberGroups[p_id] = [];
            tempMemberGroups[p_id] = tempMemberGroups[p_id].concat(node);
          }
          Object.keys(tempMemberGroups).forEach(function(p_id2) {
            if (tempMemberGroups[p_id2].length > 1) {
              var dummyCompoundId = "DummyCompound_" + p_id2;
              self.memberGroups[dummyCompoundId] = tempMemberGroups[p_id2];
              var parent2 = tempMemberGroups[p_id2][0].getParent();
              var dummyCompound = new CoSENode(self.graphManager);
              dummyCompound.id = dummyCompoundId;
              dummyCompound.paddingLeft = parent2.paddingLeft || 0;
              dummyCompound.paddingRight = parent2.paddingRight || 0;
              dummyCompound.paddingBottom = parent2.paddingBottom || 0;
              dummyCompound.paddingTop = parent2.paddingTop || 0;
              self.idToDummyNode[dummyCompoundId] = dummyCompound;
              var dummyParentGraph = self.getGraphManager().add(self.newGraph(), dummyCompound);
              var parentGraph = parent2.getChild();
              parentGraph.add(dummyCompound);
              for (var i2 = 0;i2 < tempMemberGroups[p_id2].length; i2++) {
                var node2 = tempMemberGroups[p_id2][i2];
                parentGraph.remove(node2);
                dummyParentGraph.add(node2);
              }
            }
          });
        };
        CoSELayout.prototype.clearCompounds = function() {
          var childGraphMap = {};
          var idToNode = {};
          this.performDFSOnCompounds();
          for (var i = 0;i < this.compoundOrder.length; i++) {
            idToNode[this.compoundOrder[i].id] = this.compoundOrder[i];
            childGraphMap[this.compoundOrder[i].id] = [].concat(this.compoundOrder[i].getChild().getNodes());
            this.graphManager.remove(this.compoundOrder[i].getChild());
            this.compoundOrder[i].child = null;
          }
          this.graphManager.resetAllNodes();
          this.tileCompoundMembers(childGraphMap, idToNode);
        };
        CoSELayout.prototype.clearZeroDegreeMembers = function() {
          var self = this;
          var tiledZeroDegreePack = this.tiledZeroDegreePack = [];
          Object.keys(this.memberGroups).forEach(function(id) {
            var compoundNode = self.idToDummyNode[id];
            tiledZeroDegreePack[id] = self.tileNodes(self.memberGroups[id], compoundNode.paddingLeft + compoundNode.paddingRight);
            compoundNode.rect.width = tiledZeroDegreePack[id].width;
            compoundNode.rect.height = tiledZeroDegreePack[id].height;
          });
        };
        CoSELayout.prototype.repopulateCompounds = function() {
          for (var i = this.compoundOrder.length - 1;i >= 0; i--) {
            var lCompoundNode = this.compoundOrder[i];
            var id = lCompoundNode.id;
            var horizontalMargin = lCompoundNode.paddingLeft;
            var verticalMargin = lCompoundNode.paddingTop;
            this.adjustLocations(this.tiledMemberPack[id], lCompoundNode.rect.x, lCompoundNode.rect.y, horizontalMargin, verticalMargin);
          }
        };
        CoSELayout.prototype.repopulateZeroDegreeMembers = function() {
          var self = this;
          var tiledPack = this.tiledZeroDegreePack;
          Object.keys(tiledPack).forEach(function(id) {
            var compoundNode = self.idToDummyNode[id];
            var horizontalMargin = compoundNode.paddingLeft;
            var verticalMargin = compoundNode.paddingTop;
            self.adjustLocations(tiledPack[id], compoundNode.rect.x, compoundNode.rect.y, horizontalMargin, verticalMargin);
          });
        };
        CoSELayout.prototype.getToBeTiled = function(node) {
          var id = node.id;
          if (this.toBeTiled[id] != null) {
            return this.toBeTiled[id];
          }
          var childGraph = node.getChild();
          if (childGraph == null) {
            this.toBeTiled[id] = false;
            return false;
          }
          var children = childGraph.getNodes();
          for (var i = 0;i < children.length; i++) {
            var theChild = children[i];
            if (this.getNodeDegree(theChild) > 0) {
              this.toBeTiled[id] = false;
              return false;
            }
            if (theChild.getChild() == null) {
              this.toBeTiled[theChild.id] = false;
              continue;
            }
            if (!this.getToBeTiled(theChild)) {
              this.toBeTiled[id] = false;
              return false;
            }
          }
          this.toBeTiled[id] = true;
          return true;
        };
        CoSELayout.prototype.getNodeDegree = function(node) {
          var id = node.id;
          var edges = node.getEdges();
          var degree = 0;
          for (var i = 0;i < edges.length; i++) {
            var edge = edges[i];
            if (edge.getSource().id !== edge.getTarget().id) {
              degree = degree + 1;
            }
          }
          return degree;
        };
        CoSELayout.prototype.getNodeDegreeWithChildren = function(node) {
          var degree = this.getNodeDegree(node);
          if (node.getChild() == null) {
            return degree;
          }
          var children = node.getChild().getNodes();
          for (var i = 0;i < children.length; i++) {
            var child = children[i];
            degree += this.getNodeDegreeWithChildren(child);
          }
          return degree;
        };
        CoSELayout.prototype.performDFSOnCompounds = function() {
          this.compoundOrder = [];
          this.fillCompexOrderByDFS(this.graphManager.getRoot().getNodes());
        };
        CoSELayout.prototype.fillCompexOrderByDFS = function(children) {
          for (var i = 0;i < children.length; i++) {
            var child = children[i];
            if (child.getChild() != null) {
              this.fillCompexOrderByDFS(child.getChild().getNodes());
            }
            if (this.getToBeTiled(child)) {
              this.compoundOrder.push(child);
            }
          }
        };
        CoSELayout.prototype.adjustLocations = function(organization, x, y, compoundHorizontalMargin, compoundVerticalMargin) {
          x += compoundHorizontalMargin;
          y += compoundVerticalMargin;
          var left = x;
          for (var i = 0;i < organization.rows.length; i++) {
            var row = organization.rows[i];
            x = left;
            var maxHeight = 0;
            for (var j = 0;j < row.length; j++) {
              var lnode = row[j];
              lnode.rect.x = x;
              lnode.rect.y = y;
              x += lnode.rect.width + organization.horizontalPadding;
              if (lnode.rect.height > maxHeight)
                maxHeight = lnode.rect.height;
            }
            y += maxHeight + organization.verticalPadding;
          }
        };
        CoSELayout.prototype.tileCompoundMembers = function(childGraphMap, idToNode) {
          var self = this;
          this.tiledMemberPack = [];
          Object.keys(childGraphMap).forEach(function(id) {
            var compoundNode = idToNode[id];
            self.tiledMemberPack[id] = self.tileNodes(childGraphMap[id], compoundNode.paddingLeft + compoundNode.paddingRight);
            compoundNode.rect.width = self.tiledMemberPack[id].width;
            compoundNode.rect.height = self.tiledMemberPack[id].height;
          });
        };
        CoSELayout.prototype.tileNodes = function(nodes, minWidth) {
          var verticalPadding = CoSEConstants.TILING_PADDING_VERTICAL;
          var horizontalPadding = CoSEConstants.TILING_PADDING_HORIZONTAL;
          var organization = {
            rows: [],
            rowWidth: [],
            rowHeight: [],
            width: 0,
            height: minWidth,
            verticalPadding,
            horizontalPadding
          };
          nodes.sort(function(n1, n2) {
            if (n1.rect.width * n1.rect.height > n2.rect.width * n2.rect.height)
              return -1;
            if (n1.rect.width * n1.rect.height < n2.rect.width * n2.rect.height)
              return 1;
            return 0;
          });
          for (var i = 0;i < nodes.length; i++) {
            var lNode = nodes[i];
            if (organization.rows.length == 0) {
              this.insertNodeToRow(organization, lNode, 0, minWidth);
            } else if (this.canAddHorizontal(organization, lNode.rect.width, lNode.rect.height)) {
              this.insertNodeToRow(organization, lNode, this.getShortestRowIndex(organization), minWidth);
            } else {
              this.insertNodeToRow(organization, lNode, organization.rows.length, minWidth);
            }
            this.shiftToLastRow(organization);
          }
          return organization;
        };
        CoSELayout.prototype.insertNodeToRow = function(organization, node, rowIndex, minWidth) {
          var minCompoundSize = minWidth;
          if (rowIndex == organization.rows.length) {
            var secondDimension = [];
            organization.rows.push(secondDimension);
            organization.rowWidth.push(minCompoundSize);
            organization.rowHeight.push(0);
          }
          var w = organization.rowWidth[rowIndex] + node.rect.width;
          if (organization.rows[rowIndex].length > 0) {
            w += organization.horizontalPadding;
          }
          organization.rowWidth[rowIndex] = w;
          if (organization.width < w) {
            organization.width = w;
          }
          var h = node.rect.height;
          if (rowIndex > 0)
            h += organization.verticalPadding;
          var extraHeight = 0;
          if (h > organization.rowHeight[rowIndex]) {
            extraHeight = organization.rowHeight[rowIndex];
            organization.rowHeight[rowIndex] = h;
            extraHeight = organization.rowHeight[rowIndex] - extraHeight;
          }
          organization.height += extraHeight;
          organization.rows[rowIndex].push(node);
        };
        CoSELayout.prototype.getShortestRowIndex = function(organization) {
          var r = -1;
          var min = Number.MAX_VALUE;
          for (var i = 0;i < organization.rows.length; i++) {
            if (organization.rowWidth[i] < min) {
              r = i;
              min = organization.rowWidth[i];
            }
          }
          return r;
        };
        CoSELayout.prototype.getLongestRowIndex = function(organization) {
          var r = -1;
          var max = Number.MIN_VALUE;
          for (var i = 0;i < organization.rows.length; i++) {
            if (organization.rowWidth[i] > max) {
              r = i;
              max = organization.rowWidth[i];
            }
          }
          return r;
        };
        CoSELayout.prototype.canAddHorizontal = function(organization, extraWidth, extraHeight) {
          var sri = this.getShortestRowIndex(organization);
          if (sri < 0) {
            return true;
          }
          var min = organization.rowWidth[sri];
          if (min + organization.horizontalPadding + extraWidth <= organization.width)
            return true;
          var hDiff = 0;
          if (organization.rowHeight[sri] < extraHeight) {
            if (sri > 0)
              hDiff = extraHeight + organization.verticalPadding - organization.rowHeight[sri];
          }
          var add_to_row_ratio;
          if (organization.width - min >= extraWidth + organization.horizontalPadding) {
            add_to_row_ratio = (organization.height + hDiff) / (min + extraWidth + organization.horizontalPadding);
          } else {
            add_to_row_ratio = (organization.height + hDiff) / organization.width;
          }
          hDiff = extraHeight + organization.verticalPadding;
          var add_new_row_ratio;
          if (organization.width < extraWidth) {
            add_new_row_ratio = (organization.height + hDiff) / extraWidth;
          } else {
            add_new_row_ratio = (organization.height + hDiff) / organization.width;
          }
          if (add_new_row_ratio < 1)
            add_new_row_ratio = 1 / add_new_row_ratio;
          if (add_to_row_ratio < 1)
            add_to_row_ratio = 1 / add_to_row_ratio;
          return add_to_row_ratio < add_new_row_ratio;
        };
        CoSELayout.prototype.shiftToLastRow = function(organization) {
          var longest = this.getLongestRowIndex(organization);
          var last = organization.rowWidth.length - 1;
          var row = organization.rows[longest];
          var node = row[row.length - 1];
          var diff = node.width + organization.horizontalPadding;
          if (organization.width - organization.rowWidth[last] > diff && longest != last) {
            row.splice(-1, 1);
            organization.rows[last].push(node);
            organization.rowWidth[longest] = organization.rowWidth[longest] - diff;
            organization.rowWidth[last] = organization.rowWidth[last] + diff;
            organization.width = organization.rowWidth[instance.getLongestRowIndex(organization)];
            var maxHeight = Number.MIN_VALUE;
            for (var i = 0;i < row.length; i++) {
              if (row[i].height > maxHeight)
                maxHeight = row[i].height;
            }
            if (longest > 0)
              maxHeight += organization.verticalPadding;
            var prevTotal = organization.rowHeight[longest] + organization.rowHeight[last];
            organization.rowHeight[longest] = maxHeight;
            if (organization.rowHeight[last] < node.height + organization.verticalPadding)
              organization.rowHeight[last] = node.height + organization.verticalPadding;
            var finalTotal = organization.rowHeight[longest] + organization.rowHeight[last];
            organization.height += finalTotal - prevTotal;
            this.shiftToLastRow(organization);
          }
        };
        CoSELayout.prototype.tilingPreLayout = function() {
          if (CoSEConstants.TILE) {
            this.groupZeroDegreeMembers();
            this.clearCompounds();
            this.clearZeroDegreeMembers();
          }
        };
        CoSELayout.prototype.tilingPostLayout = function() {
          if (CoSEConstants.TILE) {
            this.repopulateZeroDegreeMembers();
            this.repopulateCompounds();
          }
        };
        CoSELayout.prototype.reduceTrees = function() {
          var prunedNodesAll = [];
          var containsLeaf = true;
          var node;
          while (containsLeaf) {
            var allNodes = this.graphManager.getAllNodes();
            var prunedNodesInStepTemp = [];
            containsLeaf = false;
            for (var i = 0;i < allNodes.length; i++) {
              node = allNodes[i];
              if (node.getEdges().length == 1 && !node.getEdges()[0].isInterGraph && node.getChild() == null) {
                prunedNodesInStepTemp.push([node, node.getEdges()[0], node.getOwner()]);
                containsLeaf = true;
              }
            }
            if (containsLeaf == true) {
              var prunedNodesInStep = [];
              for (var j = 0;j < prunedNodesInStepTemp.length; j++) {
                if (prunedNodesInStepTemp[j][0].getEdges().length == 1) {
                  prunedNodesInStep.push(prunedNodesInStepTemp[j]);
                  prunedNodesInStepTemp[j][0].getOwner().remove(prunedNodesInStepTemp[j][0]);
                }
              }
              prunedNodesAll.push(prunedNodesInStep);
              this.graphManager.resetAllNodes();
              this.graphManager.resetAllEdges();
            }
          }
          this.prunedNodesAll = prunedNodesAll;
        };
        CoSELayout.prototype.growTree = function(prunedNodesAll) {
          var lengthOfPrunedNodesInStep = prunedNodesAll.length;
          var prunedNodesInStep = prunedNodesAll[lengthOfPrunedNodesInStep - 1];
          var nodeData;
          for (var i = 0;i < prunedNodesInStep.length; i++) {
            nodeData = prunedNodesInStep[i];
            this.findPlaceforPrunedNode(nodeData);
            nodeData[2].add(nodeData[0]);
            nodeData[2].add(nodeData[1], nodeData[1].source, nodeData[1].target);
          }
          prunedNodesAll.splice(prunedNodesAll.length - 1, 1);
          this.graphManager.resetAllNodes();
          this.graphManager.resetAllEdges();
        };
        CoSELayout.prototype.findPlaceforPrunedNode = function(nodeData) {
          var gridForPrunedNode;
          var nodeToConnect;
          var prunedNode = nodeData[0];
          if (prunedNode == nodeData[1].source) {
            nodeToConnect = nodeData[1].target;
          } else {
            nodeToConnect = nodeData[1].source;
          }
          var startGridX = nodeToConnect.startX;
          var finishGridX = nodeToConnect.finishX;
          var startGridY = nodeToConnect.startY;
          var finishGridY = nodeToConnect.finishY;
          var upNodeCount = 0;
          var downNodeCount = 0;
          var rightNodeCount = 0;
          var leftNodeCount = 0;
          var controlRegions = [upNodeCount, rightNodeCount, downNodeCount, leftNodeCount];
          if (startGridY > 0) {
            for (var i = startGridX;i <= finishGridX; i++) {
              controlRegions[0] += this.grid[i][startGridY - 1].length + this.grid[i][startGridY].length - 1;
            }
          }
          if (finishGridX < this.grid.length - 1) {
            for (var i = startGridY;i <= finishGridY; i++) {
              controlRegions[1] += this.grid[finishGridX + 1][i].length + this.grid[finishGridX][i].length - 1;
            }
          }
          if (finishGridY < this.grid[0].length - 1) {
            for (var i = startGridX;i <= finishGridX; i++) {
              controlRegions[2] += this.grid[i][finishGridY + 1].length + this.grid[i][finishGridY].length - 1;
            }
          }
          if (startGridX > 0) {
            for (var i = startGridY;i <= finishGridY; i++) {
              controlRegions[3] += this.grid[startGridX - 1][i].length + this.grid[startGridX][i].length - 1;
            }
          }
          var min = Integer.MAX_VALUE;
          var minCount;
          var minIndex;
          for (var j = 0;j < controlRegions.length; j++) {
            if (controlRegions[j] < min) {
              min = controlRegions[j];
              minCount = 1;
              minIndex = j;
            } else if (controlRegions[j] == min) {
              minCount++;
            }
          }
          if (minCount == 3 && min == 0) {
            if (controlRegions[0] == 0 && controlRegions[1] == 0 && controlRegions[2] == 0) {
              gridForPrunedNode = 1;
            } else if (controlRegions[0] == 0 && controlRegions[1] == 0 && controlRegions[3] == 0) {
              gridForPrunedNode = 0;
            } else if (controlRegions[0] == 0 && controlRegions[2] == 0 && controlRegions[3] == 0) {
              gridForPrunedNode = 3;
            } else if (controlRegions[1] == 0 && controlRegions[2] == 0 && controlRegions[3] == 0) {
              gridForPrunedNode = 2;
            }
          } else if (minCount == 2 && min == 0) {
            var random = Math.floor(Math.random() * 2);
            if (controlRegions[0] == 0 && controlRegions[1] == 0) {
              if (random == 0) {
                gridForPrunedNode = 0;
              } else {
                gridForPrunedNode = 1;
              }
            } else if (controlRegions[0] == 0 && controlRegions[2] == 0) {
              if (random == 0) {
                gridForPrunedNode = 0;
              } else {
                gridForPrunedNode = 2;
              }
            } else if (controlRegions[0] == 0 && controlRegions[3] == 0) {
              if (random == 0) {
                gridForPrunedNode = 0;
              } else {
                gridForPrunedNode = 3;
              }
            } else if (controlRegions[1] == 0 && controlRegions[2] == 0) {
              if (random == 0) {
                gridForPrunedNode = 1;
              } else {
                gridForPrunedNode = 2;
              }
            } else if (controlRegions[1] == 0 && controlRegions[3] == 0) {
              if (random == 0) {
                gridForPrunedNode = 1;
              } else {
                gridForPrunedNode = 3;
              }
            } else {
              if (random == 0) {
                gridForPrunedNode = 2;
              } else {
                gridForPrunedNode = 3;
              }
            }
          } else if (minCount == 4 && min == 0) {
            var random = Math.floor(Math.random() * 4);
            gridForPrunedNode = random;
          } else {
            gridForPrunedNode = minIndex;
          }
          if (gridForPrunedNode == 0) {
            prunedNode.setCenter(nodeToConnect.getCenterX(), nodeToConnect.getCenterY() - nodeToConnect.getHeight() / 2 - FDLayoutConstants.DEFAULT_EDGE_LENGTH - prunedNode.getHeight() / 2);
          } else if (gridForPrunedNode == 1) {
            prunedNode.setCenter(nodeToConnect.getCenterX() + nodeToConnect.getWidth() / 2 + FDLayoutConstants.DEFAULT_EDGE_LENGTH + prunedNode.getWidth() / 2, nodeToConnect.getCenterY());
          } else if (gridForPrunedNode == 2) {
            prunedNode.setCenter(nodeToConnect.getCenterX(), nodeToConnect.getCenterY() + nodeToConnect.getHeight() / 2 + FDLayoutConstants.DEFAULT_EDGE_LENGTH + prunedNode.getHeight() / 2);
          } else {
            prunedNode.setCenter(nodeToConnect.getCenterX() - nodeToConnect.getWidth() / 2 - FDLayoutConstants.DEFAULT_EDGE_LENGTH - prunedNode.getWidth() / 2, nodeToConnect.getCenterY());
          }
        };
        module2.exports = CoSELayout;
      },
      function(module2, exports2, __webpack_require__) {
        var coseBase = {};
        coseBase.layoutBase = __webpack_require__(0);
        coseBase.CoSEConstants = __webpack_require__(1);
        coseBase.CoSEEdge = __webpack_require__(2);
        coseBase.CoSEGraph = __webpack_require__(3);
        coseBase.CoSEGraphManager = __webpack_require__(4);
        coseBase.CoSELayout = __webpack_require__(6);
        coseBase.CoSENode = __webpack_require__(5);
        module2.exports = coseBase;
      }
    ]);
  });
});

// node_modules/cytoscape-cose-bilkent/cytoscape-cose-bilkent.js
var require_cytoscape_cose_bilkent = __commonJS((exports, module) => {
  (function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === "object" && typeof module === "object")
      module.exports = factory(require_cose_base());
    else if (typeof define === "function" && define.amd)
      define(["cose-base"], factory);
    else if (typeof exports === "object")
      exports["cytoscapeCoseBilkent"] = factory(require_cose_base());
    else
      root["cytoscapeCoseBilkent"] = factory(root["coseBase"]);
  })(exports, function(__WEBPACK_EXTERNAL_MODULE_0__) {
    return function(modules) {
      var installedModules = {};
      function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) {
          return installedModules[moduleId].exports;
        }
        var module2 = installedModules[moduleId] = {
          i: moduleId,
          l: false,
          exports: {}
        };
        modules[moduleId].call(module2.exports, module2, module2.exports, __webpack_require__);
        module2.l = true;
        return module2.exports;
      }
      __webpack_require__.m = modules;
      __webpack_require__.c = installedModules;
      __webpack_require__.i = function(value) {
        return value;
      };
      __webpack_require__.d = function(exports2, name, getter) {
        if (!__webpack_require__.o(exports2, name)) {
          Object.defineProperty(exports2, name, {
            configurable: false,
            enumerable: true,
            get: getter
          });
        }
      };
      __webpack_require__.n = function(module2) {
        var getter = module2 && module2.__esModule ? function getDefault() {
          return module2["default"];
        } : function getModuleExports() {
          return module2;
        };
        __webpack_require__.d(getter, "a", getter);
        return getter;
      };
      __webpack_require__.o = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
      };
      __webpack_require__.p = "";
      return __webpack_require__(__webpack_require__.s = 1);
    }([
      function(module2, exports2) {
        module2.exports = __WEBPACK_EXTERNAL_MODULE_0__;
      },
      function(module2, exports2, __webpack_require__) {
        var LayoutConstants = __webpack_require__(0).layoutBase.LayoutConstants;
        var FDLayoutConstants = __webpack_require__(0).layoutBase.FDLayoutConstants;
        var CoSEConstants = __webpack_require__(0).CoSEConstants;
        var CoSELayout = __webpack_require__(0).CoSELayout;
        var CoSENode = __webpack_require__(0).CoSENode;
        var PointD = __webpack_require__(0).layoutBase.PointD;
        var DimensionD2 = __webpack_require__(0).layoutBase.DimensionD;
        var defaults = {
          ready: function ready() {},
          stop: function stop() {},
          quality: "default",
          nodeDimensionsIncludeLabels: false,
          refresh: 30,
          fit: true,
          padding: 10,
          randomize: true,
          nodeRepulsion: 4500,
          idealEdgeLength: 50,
          edgeElasticity: 0.45,
          nestingFactor: 0.1,
          gravity: 0.25,
          numIter: 2500,
          tile: true,
          animate: "end",
          animationDuration: 500,
          tilingPaddingVertical: 10,
          tilingPaddingHorizontal: 10,
          gravityRangeCompound: 1.5,
          gravityCompound: 1,
          gravityRange: 3.8,
          initialEnergyOnIncremental: 0.5
        };
        function extend(defaults2, options) {
          var obj = {};
          for (var i in defaults2) {
            obj[i] = defaults2[i];
          }
          for (var i in options) {
            obj[i] = options[i];
          }
          return obj;
        }
        function _CoSELayout(_options) {
          this.options = extend(defaults, _options);
          getUserOptions(this.options);
        }
        var getUserOptions = function getUserOptions2(options) {
          if (options.nodeRepulsion != null)
            CoSEConstants.DEFAULT_REPULSION_STRENGTH = FDLayoutConstants.DEFAULT_REPULSION_STRENGTH = options.nodeRepulsion;
          if (options.idealEdgeLength != null)
            CoSEConstants.DEFAULT_EDGE_LENGTH = FDLayoutConstants.DEFAULT_EDGE_LENGTH = options.idealEdgeLength;
          if (options.edgeElasticity != null)
            CoSEConstants.DEFAULT_SPRING_STRENGTH = FDLayoutConstants.DEFAULT_SPRING_STRENGTH = options.edgeElasticity;
          if (options.nestingFactor != null)
            CoSEConstants.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR = FDLayoutConstants.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR = options.nestingFactor;
          if (options.gravity != null)
            CoSEConstants.DEFAULT_GRAVITY_STRENGTH = FDLayoutConstants.DEFAULT_GRAVITY_STRENGTH = options.gravity;
          if (options.numIter != null)
            CoSEConstants.MAX_ITERATIONS = FDLayoutConstants.MAX_ITERATIONS = options.numIter;
          if (options.gravityRange != null)
            CoSEConstants.DEFAULT_GRAVITY_RANGE_FACTOR = FDLayoutConstants.DEFAULT_GRAVITY_RANGE_FACTOR = options.gravityRange;
          if (options.gravityCompound != null)
            CoSEConstants.DEFAULT_COMPOUND_GRAVITY_STRENGTH = FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_STRENGTH = options.gravityCompound;
          if (options.gravityRangeCompound != null)
            CoSEConstants.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR = FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR = options.gravityRangeCompound;
          if (options.initialEnergyOnIncremental != null)
            CoSEConstants.DEFAULT_COOLING_FACTOR_INCREMENTAL = FDLayoutConstants.DEFAULT_COOLING_FACTOR_INCREMENTAL = options.initialEnergyOnIncremental;
          if (options.quality == "draft")
            LayoutConstants.QUALITY = 0;
          else if (options.quality == "proof")
            LayoutConstants.QUALITY = 2;
          else
            LayoutConstants.QUALITY = 1;
          CoSEConstants.NODE_DIMENSIONS_INCLUDE_LABELS = FDLayoutConstants.NODE_DIMENSIONS_INCLUDE_LABELS = LayoutConstants.NODE_DIMENSIONS_INCLUDE_LABELS = options.nodeDimensionsIncludeLabels;
          CoSEConstants.DEFAULT_INCREMENTAL = FDLayoutConstants.DEFAULT_INCREMENTAL = LayoutConstants.DEFAULT_INCREMENTAL = !options.randomize;
          CoSEConstants.ANIMATE = FDLayoutConstants.ANIMATE = LayoutConstants.ANIMATE = options.animate;
          CoSEConstants.TILE = options.tile;
          CoSEConstants.TILING_PADDING_VERTICAL = typeof options.tilingPaddingVertical === "function" ? options.tilingPaddingVertical.call() : options.tilingPaddingVertical;
          CoSEConstants.TILING_PADDING_HORIZONTAL = typeof options.tilingPaddingHorizontal === "function" ? options.tilingPaddingHorizontal.call() : options.tilingPaddingHorizontal;
        };
        _CoSELayout.prototype.run = function() {
          var ready;
          var frameId;
          var options = this.options;
          var idToLNode = this.idToLNode = {};
          var layout = this.layout = new CoSELayout;
          var self = this;
          self.stopped = false;
          this.cy = this.options.cy;
          this.cy.trigger({ type: "layoutstart", layout: this });
          var gm = layout.newGraphManager();
          this.gm = gm;
          var nodes = this.options.eles.nodes();
          var edges = this.options.eles.edges();
          this.root = gm.addRoot();
          this.processChildrenList(this.root, this.getTopMostNodes(nodes), layout);
          for (var i = 0;i < edges.length; i++) {
            var edge = edges[i];
            var sourceNode = this.idToLNode[edge.data("source")];
            var targetNode = this.idToLNode[edge.data("target")];
            if (sourceNode !== targetNode && sourceNode.getEdgesBetween(targetNode).length == 0) {
              var e1 = gm.add(layout.newEdge(), sourceNode, targetNode);
              e1.id = edge.id();
            }
          }
          var getPositions = function getPositions2(ele, i2) {
            if (typeof ele === "number") {
              ele = i2;
            }
            var theId = ele.data("id");
            var lNode = self.idToLNode[theId];
            return {
              x: lNode.getRect().getCenterX(),
              y: lNode.getRect().getCenterY()
            };
          };
          var iterateAnimated = function iterateAnimated2() {
            var afterReposition = function afterReposition2() {
              if (options.fit) {
                options.cy.fit(options.eles, options.padding);
              }
              if (!ready) {
                ready = true;
                self.cy.one("layoutready", options.ready);
                self.cy.trigger({ type: "layoutready", layout: self });
              }
            };
            var ticksPerFrame = self.options.refresh;
            var isDone;
            for (var i2 = 0;i2 < ticksPerFrame && !isDone; i2++) {
              isDone = self.stopped || self.layout.tick();
            }
            if (isDone) {
              if (layout.checkLayoutSuccess() && !layout.isSubLayout) {
                layout.doPostLayout();
              }
              if (layout.tilingPostLayout) {
                layout.tilingPostLayout();
              }
              layout.isLayoutFinished = true;
              self.options.eles.nodes().positions(getPositions);
              afterReposition();
              self.cy.one("layoutstop", self.options.stop);
              self.cy.trigger({ type: "layoutstop", layout: self });
              if (frameId) {
                cancelAnimationFrame(frameId);
              }
              ready = false;
              return;
            }
            var animationData = self.layout.getPositionsData();
            options.eles.nodes().positions(function(ele, i3) {
              if (typeof ele === "number") {
                ele = i3;
              }
              if (!ele.isParent()) {
                var theId = ele.id();
                var pNode = animationData[theId];
                var temp = ele;
                while (pNode == null) {
                  pNode = animationData[temp.data("parent")] || animationData["DummyCompound_" + temp.data("parent")];
                  animationData[theId] = pNode;
                  temp = temp.parent()[0];
                  if (temp == undefined) {
                    break;
                  }
                }
                if (pNode != null) {
                  return {
                    x: pNode.x,
                    y: pNode.y
                  };
                } else {
                  return {
                    x: ele.position("x"),
                    y: ele.position("y")
                  };
                }
              }
            });
            afterReposition();
            frameId = requestAnimationFrame(iterateAnimated2);
          };
          layout.addListener("layoutstarted", function() {
            if (self.options.animate === "during") {
              frameId = requestAnimationFrame(iterateAnimated);
            }
          });
          layout.runLayout();
          if (this.options.animate !== "during") {
            self.options.eles.nodes().not(":parent").layoutPositions(self, self.options, getPositions);
            ready = false;
          }
          return this;
        };
        _CoSELayout.prototype.getTopMostNodes = function(nodes) {
          var nodesMap = {};
          for (var i = 0;i < nodes.length; i++) {
            nodesMap[nodes[i].id()] = true;
          }
          var roots = nodes.filter(function(ele, i2) {
            if (typeof ele === "number") {
              ele = i2;
            }
            var parent = ele.parent()[0];
            while (parent != null) {
              if (nodesMap[parent.id()]) {
                return false;
              }
              parent = parent.parent()[0];
            }
            return true;
          });
          return roots;
        };
        _CoSELayout.prototype.processChildrenList = function(parent, children, layout) {
          var size = children.length;
          for (var i = 0;i < size; i++) {
            var theChild = children[i];
            var children_of_children = theChild.children();
            var theNode;
            var dimensions = theChild.layoutDimensions({
              nodeDimensionsIncludeLabels: this.options.nodeDimensionsIncludeLabels
            });
            if (theChild.outerWidth() != null && theChild.outerHeight() != null) {
              theNode = parent.add(new CoSENode(layout.graphManager, new PointD(theChild.position("x") - dimensions.w / 2, theChild.position("y") - dimensions.h / 2), new DimensionD2(parseFloat(dimensions.w), parseFloat(dimensions.h))));
            } else {
              theNode = parent.add(new CoSENode(this.graphManager));
            }
            theNode.id = theChild.data("id");
            theNode.paddingLeft = parseInt(theChild.css("padding"));
            theNode.paddingTop = parseInt(theChild.css("padding"));
            theNode.paddingRight = parseInt(theChild.css("padding"));
            theNode.paddingBottom = parseInt(theChild.css("padding"));
            if (this.options.nodeDimensionsIncludeLabels) {
              if (theChild.isParent()) {
                var labelWidth = theChild.boundingBox({ includeLabels: true, includeNodes: false }).w;
                var labelHeight = theChild.boundingBox({ includeLabels: true, includeNodes: false }).h;
                var labelPos = theChild.css("text-halign");
                theNode.labelWidth = labelWidth;
                theNode.labelHeight = labelHeight;
                theNode.labelPos = labelPos;
              }
            }
            this.idToLNode[theChild.data("id")] = theNode;
            if (isNaN(theNode.rect.x)) {
              theNode.rect.x = 0;
            }
            if (isNaN(theNode.rect.y)) {
              theNode.rect.y = 0;
            }
            if (children_of_children != null && children_of_children.length > 0) {
              var theNewGraph;
              theNewGraph = layout.getGraphManager().add(layout.newGraph(), theNode);
              this.processChildrenList(theNewGraph, children_of_children, layout);
            }
          }
        };
        _CoSELayout.prototype.stop = function() {
          this.stopped = true;
          return this;
        };
        var register = function register2(cytoscape3) {
          cytoscape3("layout", "cose-bilkent", _CoSELayout);
        };
        if (typeof cytoscape !== "undefined") {
          register(cytoscape);
        }
        module2.exports = register;
      }
    ]);
  });
});

// node_modules/mermaid/dist/chunks/mermaid.core/cose-bilkent-S5V4N54A.mjs
var import_cytoscape_cose_bilkent = __toESM(require_cytoscape_cose_bilkent(), 1);
cytoscape2.use(import_cytoscape_cose_bilkent.default);
function addNodes(nodes, cy) {
  nodes.forEach((node) => {
    const nodeData = {
      id: node.id,
      labelText: node.label,
      height: node.height,
      width: node.width,
      padding: node.padding ?? 0
    };
    Object.keys(node).forEach((key) => {
      if (!["id", "label", "height", "width", "padding", "x", "y"].includes(key)) {
        nodeData[key] = node[key];
      }
    });
    cy.add({
      group: "nodes",
      data: nodeData,
      position: {
        x: node.x ?? 0,
        y: node.y ?? 0
      }
    });
  });
}
__name(addNodes, "addNodes");
function addEdges(edges, cy) {
  edges.forEach((edge) => {
    const edgeData = {
      id: edge.id,
      source: edge.start,
      target: edge.end
    };
    Object.keys(edge).forEach((key) => {
      if (!["id", "start", "end"].includes(key)) {
        edgeData[key] = edge[key];
      }
    });
    cy.add({
      group: "edges",
      data: edgeData
    });
  });
}
__name(addEdges, "addEdges");
function createCytoscapeInstance(data) {
  return new Promise((resolve) => {
    const renderEl = select_default("body").append("div").attr("id", "cy").attr("style", "display:none");
    const cy = cytoscape2({
      container: document.getElementById("cy"),
      style: [
        {
          selector: "edge",
          style: {
            "curve-style": "bezier"
          }
        }
      ]
    });
    renderEl.remove();
    addNodes(data.nodes, cy);
    addEdges(data.edges, cy);
    cy.nodes().forEach(function(n) {
      n.layoutDimensions = () => {
        const nodeData = n.data();
        return { w: nodeData.width, h: nodeData.height };
      };
    });
    const layoutConfig = {
      name: "cose-bilkent",
      quality: "proof",
      styleEnabled: false,
      animate: false
    };
    cy.layout(layoutConfig).run();
    cy.ready((e) => {
      log.info("Cytoscape ready", e);
      resolve(cy);
    });
  });
}
__name(createCytoscapeInstance, "createCytoscapeInstance");
function extractPositionedNodes(cy) {
  return cy.nodes().map((node) => {
    const data = node.data();
    const position = node.position();
    const positionedNode = {
      id: data.id,
      x: position.x,
      y: position.y
    };
    Object.keys(data).forEach((key) => {
      if (key !== "id") {
        positionedNode[key] = data[key];
      }
    });
    return positionedNode;
  });
}
__name(extractPositionedNodes, "extractPositionedNodes");
function extractPositionedEdges(cy) {
  return cy.edges().map((edge) => {
    const data = edge.data();
    const rscratch = edge._private.rscratch;
    const positionedEdge = {
      id: data.id,
      source: data.source,
      target: data.target,
      startX: rscratch.startX,
      startY: rscratch.startY,
      midX: rscratch.midX,
      midY: rscratch.midY,
      endX: rscratch.endX,
      endY: rscratch.endY
    };
    Object.keys(data).forEach((key) => {
      if (!["id", "source", "target"].includes(key)) {
        positionedEdge[key] = data[key];
      }
    });
    return positionedEdge;
  });
}
__name(extractPositionedEdges, "extractPositionedEdges");
async function executeCoseBilkentLayout(data, _config) {
  log.debug("Starting cose-bilkent layout algorithm");
  try {
    validateLayoutData(data);
    const cy = await createCytoscapeInstance(data);
    const positionedNodes = extractPositionedNodes(cy);
    const positionedEdges = extractPositionedEdges(cy);
    log.debug(`Layout completed: ${positionedNodes.length} nodes, ${positionedEdges.length} edges`);
    return {
      nodes: positionedNodes,
      edges: positionedEdges
    };
  } catch (error) {
    log.error("Error in cose-bilkent layout algorithm:", error);
    throw error;
  }
}
__name(executeCoseBilkentLayout, "executeCoseBilkentLayout");
function validateLayoutData(data) {
  if (!data) {
    throw new Error("Layout data is required");
  }
  if (!data.config) {
    throw new Error("Configuration is required in layout data");
  }
  if (!data.rootNode) {
    throw new Error("Root node is required");
  }
  if (!data.nodes || !Array.isArray(data.nodes)) {
    throw new Error("No nodes found in layout data");
  }
  if (!Array.isArray(data.edges)) {
    throw new Error("Edges array is required in layout data");
  }
  return true;
}
__name(validateLayoutData, "validateLayoutData");
var render = /* @__PURE__ */ __name(async (data4Layout, svg, {
  insertCluster,
  insertEdge,
  insertEdgeLabel,
  insertMarkers,
  insertNode,
  log: log2,
  positionEdgeLabel
}, { algorithm: _algorithm }) => {
  const nodeDb = {};
  const clusterDb = {};
  const element = svg.select("g");
  insertMarkers(element, data4Layout.markers, data4Layout.type, data4Layout.diagramId);
  const subGraphsEl = element.insert("g").attr("class", "subgraphs");
  const edgePaths = element.insert("g").attr("class", "edgePaths");
  const edgeLabels = element.insert("g").attr("class", "edgeLabels");
  const nodes = element.insert("g").attr("class", "nodes");
  log2.debug("Inserting nodes into DOM for dimension calculation");
  await Promise.all(data4Layout.nodes.map(async (node) => {
    if (node.isGroup) {
      const clusterNode = { ...node };
      clusterDb[node.id] = clusterNode;
      nodeDb[node.id] = clusterNode;
      await insertCluster(subGraphsEl, node);
    } else {
      const nodeWithPosition = { ...node };
      nodeDb[node.id] = nodeWithPosition;
      const nodeEl = await insertNode(nodes, node, {
        config: data4Layout.config,
        dir: data4Layout.direction || "TB"
      });
      const boundingBox = nodeEl.node().getBBox();
      nodeWithPosition.width = boundingBox.width;
      nodeWithPosition.height = boundingBox.height;
      nodeWithPosition.domId = nodeEl;
      log2.debug(`Node ${node.id} dimensions: ${boundingBox.width}x${boundingBox.height}`);
    }
  }));
  log2.debug("Running cose-bilkent layout algorithm");
  const updatedLayoutData = {
    ...data4Layout,
    nodes: data4Layout.nodes.map((node) => {
      const nodeWithDimensions = nodeDb[node.id];
      return {
        ...node,
        width: nodeWithDimensions.width,
        height: nodeWithDimensions.height
      };
    })
  };
  const layoutResult = await executeCoseBilkentLayout(updatedLayoutData, data4Layout.config);
  log2.debug("Positioning nodes based on layout results");
  layoutResult.nodes.forEach((positionedNode) => {
    const node = nodeDb[positionedNode.id];
    if (node?.domId) {
      node.domId.attr("transform", `translate(${positionedNode.x}, ${positionedNode.y})`);
      node.x = positionedNode.x;
      node.y = positionedNode.y;
      log2.debug(`Positioned node ${node.id} at center (${positionedNode.x}, ${positionedNode.y})`);
    }
  });
  layoutResult.edges.forEach((positionedEdge) => {
    const edge = data4Layout.edges.find((e) => e.id === positionedEdge.id);
    if (edge) {
      edge.points = [
        { x: positionedEdge.startX, y: positionedEdge.startY },
        { x: positionedEdge.midX, y: positionedEdge.midY },
        { x: positionedEdge.endX, y: positionedEdge.endY }
      ];
    }
  });
  log2.debug("Inserting and positioning edges");
  await Promise.all(data4Layout.edges.map(async (edge) => {
    const _edgeLabel = await insertEdgeLabel(edgeLabels, edge);
    const startNode = nodeDb[edge.start ?? ""];
    const endNode = nodeDb[edge.end ?? ""];
    if (startNode && endNode) {
      const positionedEdge = layoutResult.edges.find((e) => e.id === edge.id);
      if (positionedEdge) {
        log2.debug("APA01 positionedEdge", positionedEdge);
        const edgeWithPath = { ...edge };
        const paths = insertEdge(edgePaths, edgeWithPath, clusterDb, data4Layout.type, startNode, endNode, data4Layout.diagramId);
        positionEdgeLabel(edgeWithPath, paths);
      } else {
        const edgeWithPath = {
          ...edge,
          points: [
            { x: startNode.x || 0, y: startNode.y || 0 },
            { x: endNode.x || 0, y: endNode.y || 0 }
          ]
        };
        const paths = insertEdge(edgePaths, edgeWithPath, clusterDb, data4Layout.type, startNode, endNode, data4Layout.diagramId);
        positionEdgeLabel(edgeWithPath, paths);
      }
    }
  }));
  log2.debug("Cose-bilkent rendering completed");
}, "render");
var render2 = render;
export {
  render2 as render
};

//# debugId=9E926F2A4295680664756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xheW91dC1iYXNlL2xheW91dC1iYXNlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb3NlLWJhc2UvY29zZS1iYXNlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jeXRvc2NhcGUtY29zZS1iaWxrZW50L2N5dG9zY2FwZS1jb3NlLWJpbGtlbnQuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL2Nvc2UtYmlsa2VudC1TNVY0TjU0QS5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbCiAgICAiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wibGF5b3V0QmFzZVwiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJsYXlvdXRCYXNlXCJdID0gZmFjdG9yeSgpO1xufSkodGhpcywgZnVuY3Rpb24oKSB7XG5yZXR1cm4gLyoqKioqKi8gKGZ1bmN0aW9uKG1vZHVsZXMpIHsgLy8gd2VicGFja0Jvb3RzdHJhcFxuLyoqKioqKi8gXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuLyoqKioqKi8gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuLyoqKioqKi8gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4vKioqKioqLyBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbi8qKioqKiovIFx0XHR9XG4vKioqKioqLyBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbi8qKioqKiovIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4vKioqKioqLyBcdFx0XHRpOiBtb2R1bGVJZCxcbi8qKioqKiovIFx0XHRcdGw6IGZhbHNlLFxuLyoqKioqKi8gXHRcdFx0ZXhwb3J0czoge31cbi8qKioqKiovIFx0XHR9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbi8qKioqKiovIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuLyoqKioqKi8gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbi8qKioqKiovIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4vKioqKioqLyBcdH1cbi8qKioqKiovXG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGlkZW50aXR5IGZ1bmN0aW9uIGZvciBjYWxsaW5nIGhhcm1vbnkgaW1wb3J0cyB3aXRoIHRoZSBjb3JyZWN0IGNvbnRleHRcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5pID0gZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuLyoqKioqKi8gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbi8qKioqKiovIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4vKioqKioqLyBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4vKioqKioqLyBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4vKioqKioqLyBcdFx0XHRcdGdldDogZ2V0dGVyXG4vKioqKioqLyBcdFx0XHR9KTtcbi8qKioqKiovIFx0XHR9XG4vKioqKioqLyBcdH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbi8qKioqKiovIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbi8qKioqKiovIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4vKioqKioqLyBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuLyoqKioqKi8gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbi8qKioqKiovIFx0XHRyZXR1cm4gZ2V0dGVyO1xuLyoqKioqKi8gXHR9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8qKioqKiovIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMjYpO1xuLyoqKioqKi8gfSlcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyAoW1xuLyogMCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcblxuXG5mdW5jdGlvbiBMYXlvdXRDb25zdGFudHMoKSB7fVxuXG4vKipcclxuICogTGF5b3V0IFF1YWxpdHk6IDA6ZHJhZnQsIDE6ZGVmYXVsdCwgMjpwcm9vZlxyXG4gKi9cbkxheW91dENvbnN0YW50cy5RVUFMSVRZID0gMTtcblxuLyoqXHJcbiAqIERlZmF1bHQgcGFyYW1ldGVyc1xyXG4gKi9cbkxheW91dENvbnN0YW50cy5ERUZBVUxUX0NSRUFURV9CRU5EU19BU19ORUVERUQgPSBmYWxzZTtcbkxheW91dENvbnN0YW50cy5ERUZBVUxUX0lOQ1JFTUVOVEFMID0gZmFsc2U7XG5MYXlvdXRDb25zdGFudHMuREVGQVVMVF9BTklNQVRJT05fT05fTEFZT1VUID0gdHJ1ZTtcbkxheW91dENvbnN0YW50cy5ERUZBVUxUX0FOSU1BVElPTl9EVVJJTkdfTEFZT1VUID0gZmFsc2U7XG5MYXlvdXRDb25zdGFudHMuREVGQVVMVF9BTklNQVRJT05fUEVSSU9EID0gNTA7XG5MYXlvdXRDb25zdGFudHMuREVGQVVMVF9VTklGT1JNX0xFQUZfTk9ERV9TSVpFUyA9IGZhbHNlO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU2VjdGlvbjogR2VuZXJhbCBvdGhlciBjb25zdGFudHNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vKlxyXG4gKiBNYXJnaW5zIG9mIGEgZ3JhcGggdG8gYmUgYXBwbGllZCBvbiBib3VkaW5nIHJlY3RhbmdsZSBvZiBpdHMgY29udGVudHMuIFdlXHJcbiAqIGFzc3VtZSBtYXJnaW5zIG9uIGFsbCBmb3VyIHNpZGVzIHRvIGJlIHVuaWZvcm0uXHJcbiAqL1xuTGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfR1JBUEhfTUFSR0lOID0gMTU7XG5cbi8qXHJcbiAqIFdoZXRoZXIgdG8gY29uc2lkZXIgbGFiZWxzIGluIG5vZGUgZGltZW5zaW9ucyBvciBub3RcclxuICovXG5MYXlvdXRDb25zdGFudHMuTk9ERV9ESU1FTlNJT05TX0lOQ0xVREVfTEFCRUxTID0gZmFsc2U7XG5cbi8qXHJcbiAqIERlZmF1bHQgZGltZW5zaW9uIG9mIGEgbm9uLWNvbXBvdW5kIG5vZGUuXHJcbiAqL1xuTGF5b3V0Q29uc3RhbnRzLlNJTVBMRV9OT0RFX1NJWkUgPSA0MDtcblxuLypcclxuICogRGVmYXVsdCBkaW1lbnNpb24gb2YgYSBub24tY29tcG91bmQgbm9kZS5cclxuICovXG5MYXlvdXRDb25zdGFudHMuU0lNUExFX05PREVfSEFMRl9TSVpFID0gTGF5b3V0Q29uc3RhbnRzLlNJTVBMRV9OT0RFX1NJWkUgLyAyO1xuXG4vKlxyXG4gKiBFbXB0eSBjb21wb3VuZCBub2RlIHNpemUuIFdoZW4gYSBjb21wb3VuZCBub2RlIGlzIGVtcHR5LCBpdHMgYm90aFxyXG4gKiBkaW1lbnNpb25zIHNob3VsZCBiZSBvZiB0aGlzIHZhbHVlLlxyXG4gKi9cbkxheW91dENvbnN0YW50cy5FTVBUWV9DT01QT1VORF9OT0RFX1NJWkUgPSA0MDtcblxuLypcclxuICogTWluaW11bSBsZW5ndGggdGhhdCBhbiBlZGdlIHNob3VsZCB0YWtlIGR1cmluZyBsYXlvdXRcclxuICovXG5MYXlvdXRDb25zdGFudHMuTUlOX0VER0VfTEVOR1RIID0gMTtcblxuLypcclxuICogV29ybGQgYm91bmRhcmllcyB0aGF0IGxheW91dCBvcGVyYXRlcyBvblxyXG4gKi9cbkxheW91dENvbnN0YW50cy5XT1JMRF9CT1VOREFSWSA9IDEwMDAwMDA7XG5cbi8qXHJcbiAqIFdvcmxkIGJvdW5kYXJpZXMgdGhhdCByYW5kb20gcG9zaXRpb25pbmcgY2FuIGJlIHBlcmZvcm1lZCB3aXRoXHJcbiAqL1xuTGF5b3V0Q29uc3RhbnRzLklOSVRJQUxfV09STERfQk9VTkRBUlkgPSBMYXlvdXRDb25zdGFudHMuV09STERfQk9VTkRBUlkgLyAxMDAwO1xuXG4vKlxyXG4gKiBDb29yZGluYXRlcyBvZiB0aGUgd29ybGQgY2VudGVyXHJcbiAqL1xuTGF5b3V0Q29uc3RhbnRzLldPUkxEX0NFTlRFUl9YID0gMTIwMDtcbkxheW91dENvbnN0YW50cy5XT1JMRF9DRU5URVJfWSA9IDkwMDtcblxubW9kdWxlLmV4cG9ydHMgPSBMYXlvdXRDb25zdGFudHM7XG5cbi8qKiovIH0pLFxuLyogMSAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcblxuXG52YXIgTEdyYXBoT2JqZWN0ID0gX193ZWJwYWNrX3JlcXVpcmVfXygyKTtcbnZhciBJR2VvbWV0cnkgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDgpO1xudmFyIElNYXRoID0gX193ZWJwYWNrX3JlcXVpcmVfXyg5KTtcblxuZnVuY3Rpb24gTEVkZ2Uoc291cmNlLCB0YXJnZXQsIHZFZGdlKSB7XG4gIExHcmFwaE9iamVjdC5jYWxsKHRoaXMsIHZFZGdlKTtcblxuICB0aGlzLmlzT3ZlcmxhcGluZ1NvdXJjZUFuZFRhcmdldCA9IGZhbHNlO1xuICB0aGlzLnZHcmFwaE9iamVjdCA9IHZFZGdlO1xuICB0aGlzLmJlbmRwb2ludHMgPSBbXTtcbiAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XG4gIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xufVxuXG5MRWRnZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKExHcmFwaE9iamVjdC5wcm90b3R5cGUpO1xuXG5mb3IgKHZhciBwcm9wIGluIExHcmFwaE9iamVjdCkge1xuICBMRWRnZVtwcm9wXSA9IExHcmFwaE9iamVjdFtwcm9wXTtcbn1cblxuTEVkZ2UucHJvdG90eXBlLmdldFNvdXJjZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuc291cmNlO1xufTtcblxuTEVkZ2UucHJvdG90eXBlLmdldFRhcmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMudGFyZ2V0O1xufTtcblxuTEVkZ2UucHJvdG90eXBlLmlzSW50ZXJHcmFwaCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuaXNJbnRlckdyYXBoO1xufTtcblxuTEVkZ2UucHJvdG90eXBlLmdldExlbmd0aCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMubGVuZ3RoO1xufTtcblxuTEVkZ2UucHJvdG90eXBlLmlzT3ZlcmxhcGluZ1NvdXJjZUFuZFRhcmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuaXNPdmVybGFwaW5nU291cmNlQW5kVGFyZ2V0O1xufTtcblxuTEVkZ2UucHJvdG90eXBlLmdldEJlbmRwb2ludHMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmJlbmRwb2ludHM7XG59O1xuXG5MRWRnZS5wcm90b3R5cGUuZ2V0TGNhID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5sY2E7XG59O1xuXG5MRWRnZS5wcm90b3R5cGUuZ2V0U291cmNlSW5MY2EgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnNvdXJjZUluTGNhO1xufTtcblxuTEVkZ2UucHJvdG90eXBlLmdldFRhcmdldEluTGNhID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy50YXJnZXRJbkxjYTtcbn07XG5cbkxFZGdlLnByb3RvdHlwZS5nZXRPdGhlckVuZCA9IGZ1bmN0aW9uIChub2RlKSB7XG4gIGlmICh0aGlzLnNvdXJjZSA9PT0gbm9kZSkge1xuICAgIHJldHVybiB0aGlzLnRhcmdldDtcbiAgfSBlbHNlIGlmICh0aGlzLnRhcmdldCA9PT0gbm9kZSkge1xuICAgIHJldHVybiB0aGlzLnNvdXJjZTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBcIk5vZGUgaXMgbm90IGluY2lkZW50IHdpdGggdGhpcyBlZGdlXCI7XG4gIH1cbn07XG5cbkxFZGdlLnByb3RvdHlwZS5nZXRPdGhlckVuZEluR3JhcGggPSBmdW5jdGlvbiAobm9kZSwgZ3JhcGgpIHtcbiAgdmFyIG90aGVyRW5kID0gdGhpcy5nZXRPdGhlckVuZChub2RlKTtcbiAgdmFyIHJvb3QgPSBncmFwaC5nZXRHcmFwaE1hbmFnZXIoKS5nZXRSb290KCk7XG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBpZiAob3RoZXJFbmQuZ2V0T3duZXIoKSA9PSBncmFwaCkge1xuICAgICAgcmV0dXJuIG90aGVyRW5kO1xuICAgIH1cblxuICAgIGlmIChvdGhlckVuZC5nZXRPd25lcigpID09IHJvb3QpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIG90aGVyRW5kID0gb3RoZXJFbmQuZ2V0T3duZXIoKS5nZXRQYXJlbnQoKTtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufTtcblxuTEVkZ2UucHJvdG90eXBlLnVwZGF0ZUxlbmd0aCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGNsaXBQb2ludENvb3JkaW5hdGVzID0gbmV3IEFycmF5KDQpO1xuXG4gIHRoaXMuaXNPdmVybGFwaW5nU291cmNlQW5kVGFyZ2V0ID0gSUdlb21ldHJ5LmdldEludGVyc2VjdGlvbih0aGlzLnRhcmdldC5nZXRSZWN0KCksIHRoaXMuc291cmNlLmdldFJlY3QoKSwgY2xpcFBvaW50Q29vcmRpbmF0ZXMpO1xuXG4gIGlmICghdGhpcy5pc092ZXJsYXBpbmdTb3VyY2VBbmRUYXJnZXQpIHtcbiAgICB0aGlzLmxlbmd0aFggPSBjbGlwUG9pbnRDb29yZGluYXRlc1swXSAtIGNsaXBQb2ludENvb3JkaW5hdGVzWzJdO1xuICAgIHRoaXMubGVuZ3RoWSA9IGNsaXBQb2ludENvb3JkaW5hdGVzWzFdIC0gY2xpcFBvaW50Q29vcmRpbmF0ZXNbM107XG5cbiAgICBpZiAoTWF0aC5hYnModGhpcy5sZW5ndGhYKSA8IDEuMCkge1xuICAgICAgdGhpcy5sZW5ndGhYID0gSU1hdGguc2lnbih0aGlzLmxlbmd0aFgpO1xuICAgIH1cblxuICAgIGlmIChNYXRoLmFicyh0aGlzLmxlbmd0aFkpIDwgMS4wKSB7XG4gICAgICB0aGlzLmxlbmd0aFkgPSBJTWF0aC5zaWduKHRoaXMubGVuZ3RoWSk7XG4gICAgfVxuXG4gICAgdGhpcy5sZW5ndGggPSBNYXRoLnNxcnQodGhpcy5sZW5ndGhYICogdGhpcy5sZW5ndGhYICsgdGhpcy5sZW5ndGhZICogdGhpcy5sZW5ndGhZKTtcbiAgfVxufTtcblxuTEVkZ2UucHJvdG90eXBlLnVwZGF0ZUxlbmd0aFNpbXBsZSA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5sZW5ndGhYID0gdGhpcy50YXJnZXQuZ2V0Q2VudGVyWCgpIC0gdGhpcy5zb3VyY2UuZ2V0Q2VudGVyWCgpO1xuICB0aGlzLmxlbmd0aFkgPSB0aGlzLnRhcmdldC5nZXRDZW50ZXJZKCkgLSB0aGlzLnNvdXJjZS5nZXRDZW50ZXJZKCk7XG5cbiAgaWYgKE1hdGguYWJzKHRoaXMubGVuZ3RoWCkgPCAxLjApIHtcbiAgICB0aGlzLmxlbmd0aFggPSBJTWF0aC5zaWduKHRoaXMubGVuZ3RoWCk7XG4gIH1cblxuICBpZiAoTWF0aC5hYnModGhpcy5sZW5ndGhZKSA8IDEuMCkge1xuICAgIHRoaXMubGVuZ3RoWSA9IElNYXRoLnNpZ24odGhpcy5sZW5ndGhZKTtcbiAgfVxuXG4gIHRoaXMubGVuZ3RoID0gTWF0aC5zcXJ0KHRoaXMubGVuZ3RoWCAqIHRoaXMubGVuZ3RoWCArIHRoaXMubGVuZ3RoWSAqIHRoaXMubGVuZ3RoWSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExFZGdlO1xuXG4vKioqLyB9KSxcbi8qIDIgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cblxuZnVuY3Rpb24gTEdyYXBoT2JqZWN0KHZHcmFwaE9iamVjdCkge1xuICB0aGlzLnZHcmFwaE9iamVjdCA9IHZHcmFwaE9iamVjdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMR3JhcGhPYmplY3Q7XG5cbi8qKiovIH0pLFxuLyogMyAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcblxuXG52YXIgTEdyYXBoT2JqZWN0ID0gX193ZWJwYWNrX3JlcXVpcmVfXygyKTtcbnZhciBJbnRlZ2VyID0gX193ZWJwYWNrX3JlcXVpcmVfXygxMCk7XG52YXIgUmVjdGFuZ2xlRCA9IF9fd2VicGFja19yZXF1aXJlX18oMTMpO1xudmFyIExheW91dENvbnN0YW50cyA9IF9fd2VicGFja19yZXF1aXJlX18oMCk7XG52YXIgUmFuZG9tU2VlZCA9IF9fd2VicGFja19yZXF1aXJlX18oMTYpO1xudmFyIFBvaW50RCA9IF9fd2VicGFja19yZXF1aXJlX18oNCk7XG5cbmZ1bmN0aW9uIExOb2RlKGdtLCBsb2MsIHNpemUsIHZOb2RlKSB7XG4gIC8vQWx0ZXJuYXRpdmUgY29uc3RydWN0b3IgMSA6IExOb2RlKExHcmFwaE1hbmFnZXIgZ20sIFBvaW50IGxvYywgRGltZW5zaW9uIHNpemUsIE9iamVjdCB2Tm9kZSlcbiAgaWYgKHNpemUgPT0gbnVsbCAmJiB2Tm9kZSA9PSBudWxsKSB7XG4gICAgdk5vZGUgPSBsb2M7XG4gIH1cblxuICBMR3JhcGhPYmplY3QuY2FsbCh0aGlzLCB2Tm9kZSk7XG5cbiAgLy9BbHRlcm5hdGl2ZSBjb25zdHJ1Y3RvciAyIDogTE5vZGUoTGF5b3V0IGxheW91dCwgT2JqZWN0IHZOb2RlKVxuICBpZiAoZ20uZ3JhcGhNYW5hZ2VyICE9IG51bGwpIGdtID0gZ20uZ3JhcGhNYW5hZ2VyO1xuXG4gIHRoaXMuZXN0aW1hdGVkU2l6ZSA9IEludGVnZXIuTUlOX1ZBTFVFO1xuICB0aGlzLmluY2x1c2lvblRyZWVEZXB0aCA9IEludGVnZXIuTUFYX1ZBTFVFO1xuICB0aGlzLnZHcmFwaE9iamVjdCA9IHZOb2RlO1xuICB0aGlzLmVkZ2VzID0gW107XG4gIHRoaXMuZ3JhcGhNYW5hZ2VyID0gZ207XG5cbiAgaWYgKHNpemUgIT0gbnVsbCAmJiBsb2MgIT0gbnVsbCkgdGhpcy5yZWN0ID0gbmV3IFJlY3RhbmdsZUQobG9jLngsIGxvYy55LCBzaXplLndpZHRoLCBzaXplLmhlaWdodCk7ZWxzZSB0aGlzLnJlY3QgPSBuZXcgUmVjdGFuZ2xlRCgpO1xufVxuXG5MTm9kZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKExHcmFwaE9iamVjdC5wcm90b3R5cGUpO1xuZm9yICh2YXIgcHJvcCBpbiBMR3JhcGhPYmplY3QpIHtcbiAgTE5vZGVbcHJvcF0gPSBMR3JhcGhPYmplY3RbcHJvcF07XG59XG5cbkxOb2RlLnByb3RvdHlwZS5nZXRFZGdlcyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZWRnZXM7XG59O1xuXG5MTm9kZS5wcm90b3R5cGUuZ2V0Q2hpbGQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmNoaWxkO1xufTtcblxuTE5vZGUucHJvdG90eXBlLmdldE93bmVyID0gZnVuY3Rpb24gKCkge1xuICAvLyAgaWYgKHRoaXMub3duZXIgIT0gbnVsbCkge1xuICAvLyAgICBpZiAoISh0aGlzLm93bmVyID09IG51bGwgfHwgdGhpcy5vd25lci5nZXROb2RlcygpLmluZGV4T2YodGhpcykgPiAtMSkpIHtcbiAgLy8gICAgICB0aHJvdyBcImFzc2VydCBmYWlsZWRcIjtcbiAgLy8gICAgfVxuICAvLyAgfVxuXG4gIHJldHVybiB0aGlzLm93bmVyO1xufTtcblxuTE5vZGUucHJvdG90eXBlLmdldFdpZHRoID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5yZWN0LndpZHRoO1xufTtcblxuTE5vZGUucHJvdG90eXBlLnNldFdpZHRoID0gZnVuY3Rpb24gKHdpZHRoKSB7XG4gIHRoaXMucmVjdC53aWR0aCA9IHdpZHRoO1xufTtcblxuTE5vZGUucHJvdG90eXBlLmdldEhlaWdodCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMucmVjdC5oZWlnaHQ7XG59O1xuXG5MTm9kZS5wcm90b3R5cGUuc2V0SGVpZ2h0ID0gZnVuY3Rpb24gKGhlaWdodCkge1xuICB0aGlzLnJlY3QuaGVpZ2h0ID0gaGVpZ2h0O1xufTtcblxuTE5vZGUucHJvdG90eXBlLmdldENlbnRlclggPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnJlY3QueCArIHRoaXMucmVjdC53aWR0aCAvIDI7XG59O1xuXG5MTm9kZS5wcm90b3R5cGUuZ2V0Q2VudGVyWSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMucmVjdC55ICsgdGhpcy5yZWN0LmhlaWdodCAvIDI7XG59O1xuXG5MTm9kZS5wcm90b3R5cGUuZ2V0Q2VudGVyID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gbmV3IFBvaW50RCh0aGlzLnJlY3QueCArIHRoaXMucmVjdC53aWR0aCAvIDIsIHRoaXMucmVjdC55ICsgdGhpcy5yZWN0LmhlaWdodCAvIDIpO1xufTtcblxuTE5vZGUucHJvdG90eXBlLmdldExvY2F0aW9uID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gbmV3IFBvaW50RCh0aGlzLnJlY3QueCwgdGhpcy5yZWN0LnkpO1xufTtcblxuTE5vZGUucHJvdG90eXBlLmdldFJlY3QgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnJlY3Q7XG59O1xuXG5MTm9kZS5wcm90b3R5cGUuZ2V0RGlhZ29uYWwgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBNYXRoLnNxcnQodGhpcy5yZWN0LndpZHRoICogdGhpcy5yZWN0LndpZHRoICsgdGhpcy5yZWN0LmhlaWdodCAqIHRoaXMucmVjdC5oZWlnaHQpO1xufTtcblxuLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIGhhbGYgdGhlIGRpYWdvbmFsIGxlbmd0aCBvZiB0aGlzIG5vZGUuXG4gKi9cbkxOb2RlLnByb3RvdHlwZS5nZXRIYWxmVGhlRGlhZ29uYWwgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBNYXRoLnNxcnQodGhpcy5yZWN0LmhlaWdodCAqIHRoaXMucmVjdC5oZWlnaHQgKyB0aGlzLnJlY3Qud2lkdGggKiB0aGlzLnJlY3Qud2lkdGgpIC8gMjtcbn07XG5cbkxOb2RlLnByb3RvdHlwZS5zZXRSZWN0ID0gZnVuY3Rpb24gKHVwcGVyTGVmdCwgZGltZW5zaW9uKSB7XG4gIHRoaXMucmVjdC54ID0gdXBwZXJMZWZ0Lng7XG4gIHRoaXMucmVjdC55ID0gdXBwZXJMZWZ0Lnk7XG4gIHRoaXMucmVjdC53aWR0aCA9IGRpbWVuc2lvbi53aWR0aDtcbiAgdGhpcy5yZWN0LmhlaWdodCA9IGRpbWVuc2lvbi5oZWlnaHQ7XG59O1xuXG5MTm9kZS5wcm90b3R5cGUuc2V0Q2VudGVyID0gZnVuY3Rpb24gKGN4LCBjeSkge1xuICB0aGlzLnJlY3QueCA9IGN4IC0gdGhpcy5yZWN0LndpZHRoIC8gMjtcbiAgdGhpcy5yZWN0LnkgPSBjeSAtIHRoaXMucmVjdC5oZWlnaHQgLyAyO1xufTtcblxuTE5vZGUucHJvdG90eXBlLnNldExvY2F0aW9uID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgdGhpcy5yZWN0LnggPSB4O1xuICB0aGlzLnJlY3QueSA9IHk7XG59O1xuXG5MTm9kZS5wcm90b3R5cGUubW92ZUJ5ID0gZnVuY3Rpb24gKGR4LCBkeSkge1xuICB0aGlzLnJlY3QueCArPSBkeDtcbiAgdGhpcy5yZWN0LnkgKz0gZHk7XG59O1xuXG5MTm9kZS5wcm90b3R5cGUuZ2V0RWRnZUxpc3RUb05vZGUgPSBmdW5jdGlvbiAodG8pIHtcbiAgdmFyIGVkZ2VMaXN0ID0gW107XG4gIHZhciBlZGdlO1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgc2VsZi5lZGdlcy5mb3JFYWNoKGZ1bmN0aW9uIChlZGdlKSB7XG5cbiAgICBpZiAoZWRnZS50YXJnZXQgPT0gdG8pIHtcbiAgICAgIGlmIChlZGdlLnNvdXJjZSAhPSBzZWxmKSB0aHJvdyBcIkluY29ycmVjdCBlZGdlIHNvdXJjZSFcIjtcblxuICAgICAgZWRnZUxpc3QucHVzaChlZGdlKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBlZGdlTGlzdDtcbn07XG5cbkxOb2RlLnByb3RvdHlwZS5nZXRFZGdlc0JldHdlZW4gPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgdmFyIGVkZ2VMaXN0ID0gW107XG4gIHZhciBlZGdlO1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5lZGdlcy5mb3JFYWNoKGZ1bmN0aW9uIChlZGdlKSB7XG5cbiAgICBpZiAoIShlZGdlLnNvdXJjZSA9PSBzZWxmIHx8IGVkZ2UudGFyZ2V0ID09IHNlbGYpKSB0aHJvdyBcIkluY29ycmVjdCBlZGdlIHNvdXJjZSBhbmQvb3IgdGFyZ2V0XCI7XG5cbiAgICBpZiAoZWRnZS50YXJnZXQgPT0gb3RoZXIgfHwgZWRnZS5zb3VyY2UgPT0gb3RoZXIpIHtcbiAgICAgIGVkZ2VMaXN0LnB1c2goZWRnZSk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gZWRnZUxpc3Q7XG59O1xuXG5MTm9kZS5wcm90b3R5cGUuZ2V0TmVpZ2hib3JzTGlzdCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG5laWdoYm9ycyA9IG5ldyBTZXQoKTtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHNlbGYuZWRnZXMuZm9yRWFjaChmdW5jdGlvbiAoZWRnZSkge1xuXG4gICAgaWYgKGVkZ2Uuc291cmNlID09IHNlbGYpIHtcbiAgICAgIG5laWdoYm9ycy5hZGQoZWRnZS50YXJnZXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZWRnZS50YXJnZXQgIT0gc2VsZikge1xuICAgICAgICB0aHJvdyBcIkluY29ycmVjdCBpbmNpZGVuY3khXCI7XG4gICAgICB9XG5cbiAgICAgIG5laWdoYm9ycy5hZGQoZWRnZS5zb3VyY2UpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIG5laWdoYm9ycztcbn07XG5cbkxOb2RlLnByb3RvdHlwZS53aXRoQ2hpbGRyZW4gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciB3aXRoTmVpZ2hib3JzTGlzdCA9IG5ldyBTZXQoKTtcbiAgdmFyIGNoaWxkTm9kZTtcbiAgdmFyIGNoaWxkcmVuO1xuXG4gIHdpdGhOZWlnaGJvcnNMaXN0LmFkZCh0aGlzKTtcblxuICBpZiAodGhpcy5jaGlsZCAhPSBudWxsKSB7XG4gICAgdmFyIG5vZGVzID0gdGhpcy5jaGlsZC5nZXROb2RlcygpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNoaWxkTm9kZSA9IG5vZGVzW2ldO1xuICAgICAgY2hpbGRyZW4gPSBjaGlsZE5vZGUud2l0aENoaWxkcmVuKCk7XG4gICAgICBjaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIHdpdGhOZWlnaGJvcnNMaXN0LmFkZChub2RlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB3aXRoTmVpZ2hib3JzTGlzdDtcbn07XG5cbkxOb2RlLnByb3RvdHlwZS5nZXROb09mQ2hpbGRyZW4gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBub09mQ2hpbGRyZW4gPSAwO1xuICB2YXIgY2hpbGROb2RlO1xuXG4gIGlmICh0aGlzLmNoaWxkID09IG51bGwpIHtcbiAgICBub09mQ2hpbGRyZW4gPSAxO1xuICB9IGVsc2Uge1xuICAgIHZhciBub2RlcyA9IHRoaXMuY2hpbGQuZ2V0Tm9kZXMoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjaGlsZE5vZGUgPSBub2Rlc1tpXTtcblxuICAgICAgbm9PZkNoaWxkcmVuICs9IGNoaWxkTm9kZS5nZXROb09mQ2hpbGRyZW4oKTtcbiAgICB9XG4gIH1cblxuICBpZiAobm9PZkNoaWxkcmVuID09IDApIHtcbiAgICBub09mQ2hpbGRyZW4gPSAxO1xuICB9XG4gIHJldHVybiBub09mQ2hpbGRyZW47XG59O1xuXG5MTm9kZS5wcm90b3R5cGUuZ2V0RXN0aW1hdGVkU2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuZXN0aW1hdGVkU2l6ZSA9PSBJbnRlZ2VyLk1JTl9WQUxVRSkge1xuICAgIHRocm93IFwiYXNzZXJ0IGZhaWxlZFwiO1xuICB9XG4gIHJldHVybiB0aGlzLmVzdGltYXRlZFNpemU7XG59O1xuXG5MTm9kZS5wcm90b3R5cGUuY2FsY0VzdGltYXRlZFNpemUgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmNoaWxkID09IG51bGwpIHtcbiAgICByZXR1cm4gdGhpcy5lc3RpbWF0ZWRTaXplID0gKHRoaXMucmVjdC53aWR0aCArIHRoaXMucmVjdC5oZWlnaHQpIC8gMjtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmVzdGltYXRlZFNpemUgPSB0aGlzLmNoaWxkLmNhbGNFc3RpbWF0ZWRTaXplKCk7XG4gICAgdGhpcy5yZWN0LndpZHRoID0gdGhpcy5lc3RpbWF0ZWRTaXplO1xuICAgIHRoaXMucmVjdC5oZWlnaHQgPSB0aGlzLmVzdGltYXRlZFNpemU7XG5cbiAgICByZXR1cm4gdGhpcy5lc3RpbWF0ZWRTaXplO1xuICB9XG59O1xuXG5MTm9kZS5wcm90b3R5cGUuc2NhdHRlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHJhbmRvbUNlbnRlclg7XG4gIHZhciByYW5kb21DZW50ZXJZO1xuXG4gIHZhciBtaW5YID0gLUxheW91dENvbnN0YW50cy5JTklUSUFMX1dPUkxEX0JPVU5EQVJZO1xuICB2YXIgbWF4WCA9IExheW91dENvbnN0YW50cy5JTklUSUFMX1dPUkxEX0JPVU5EQVJZO1xuICByYW5kb21DZW50ZXJYID0gTGF5b3V0Q29uc3RhbnRzLldPUkxEX0NFTlRFUl9YICsgUmFuZG9tU2VlZC5uZXh0RG91YmxlKCkgKiAobWF4WCAtIG1pblgpICsgbWluWDtcblxuICB2YXIgbWluWSA9IC1MYXlvdXRDb25zdGFudHMuSU5JVElBTF9XT1JMRF9CT1VOREFSWTtcbiAgdmFyIG1heFkgPSBMYXlvdXRDb25zdGFudHMuSU5JVElBTF9XT1JMRF9CT1VOREFSWTtcbiAgcmFuZG9tQ2VudGVyWSA9IExheW91dENvbnN0YW50cy5XT1JMRF9DRU5URVJfWSArIFJhbmRvbVNlZWQubmV4dERvdWJsZSgpICogKG1heFkgLSBtaW5ZKSArIG1pblk7XG5cbiAgdGhpcy5yZWN0LnggPSByYW5kb21DZW50ZXJYO1xuICB0aGlzLnJlY3QueSA9IHJhbmRvbUNlbnRlclk7XG59O1xuXG5MTm9kZS5wcm90b3R5cGUudXBkYXRlQm91bmRzID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5nZXRDaGlsZCgpID09IG51bGwpIHtcbiAgICB0aHJvdyBcImFzc2VydCBmYWlsZWRcIjtcbiAgfVxuICBpZiAodGhpcy5nZXRDaGlsZCgpLmdldE5vZGVzKCkubGVuZ3RoICE9IDApIHtcbiAgICAvLyB3cmFwIHRoZSBjaGlsZHJlbiBub2RlcyBieSByZS1hcnJhbmdpbmcgdGhlIGJvdW5kYXJpZXNcbiAgICB2YXIgY2hpbGRHcmFwaCA9IHRoaXMuZ2V0Q2hpbGQoKTtcbiAgICBjaGlsZEdyYXBoLnVwZGF0ZUJvdW5kcyh0cnVlKTtcblxuICAgIHRoaXMucmVjdC54ID0gY2hpbGRHcmFwaC5nZXRMZWZ0KCk7XG4gICAgdGhpcy5yZWN0LnkgPSBjaGlsZEdyYXBoLmdldFRvcCgpO1xuXG4gICAgdGhpcy5zZXRXaWR0aChjaGlsZEdyYXBoLmdldFJpZ2h0KCkgLSBjaGlsZEdyYXBoLmdldExlZnQoKSk7XG4gICAgdGhpcy5zZXRIZWlnaHQoY2hpbGRHcmFwaC5nZXRCb3R0b20oKSAtIGNoaWxkR3JhcGguZ2V0VG9wKCkpO1xuXG4gICAgLy8gVXBkYXRlIGNvbXBvdW5kIGJvdW5kcyBjb25zaWRlcmluZyBpdHMgbGFiZWwgcHJvcGVydGllcyAgICBcbiAgICBpZiAoTGF5b3V0Q29uc3RhbnRzLk5PREVfRElNRU5TSU9OU19JTkNMVURFX0xBQkVMUykge1xuXG4gICAgICB2YXIgd2lkdGggPSBjaGlsZEdyYXBoLmdldFJpZ2h0KCkgLSBjaGlsZEdyYXBoLmdldExlZnQoKTtcbiAgICAgIHZhciBoZWlnaHQgPSBjaGlsZEdyYXBoLmdldEJvdHRvbSgpIC0gY2hpbGRHcmFwaC5nZXRUb3AoKTtcblxuICAgICAgaWYgKHRoaXMubGFiZWxXaWR0aCA+IHdpZHRoKSB7XG4gICAgICAgIHRoaXMucmVjdC54IC09ICh0aGlzLmxhYmVsV2lkdGggLSB3aWR0aCkgLyAyO1xuICAgICAgICB0aGlzLnNldFdpZHRoKHRoaXMubGFiZWxXaWR0aCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmxhYmVsSGVpZ2h0ID4gaGVpZ2h0KSB7XG4gICAgICAgIGlmICh0aGlzLmxhYmVsUG9zID09IFwiY2VudGVyXCIpIHtcbiAgICAgICAgICB0aGlzLnJlY3QueSAtPSAodGhpcy5sYWJlbEhlaWdodCAtIGhlaWdodCkgLyAyO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMubGFiZWxQb3MgPT0gXCJ0b3BcIikge1xuICAgICAgICAgIHRoaXMucmVjdC55IC09IHRoaXMubGFiZWxIZWlnaHQgLSBoZWlnaHQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRIZWlnaHQodGhpcy5sYWJlbEhlaWdodCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5MTm9kZS5wcm90b3R5cGUuZ2V0SW5jbHVzaW9uVHJlZURlcHRoID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5pbmNsdXNpb25UcmVlRGVwdGggPT0gSW50ZWdlci5NQVhfVkFMVUUpIHtcbiAgICB0aHJvdyBcImFzc2VydCBmYWlsZWRcIjtcbiAgfVxuICByZXR1cm4gdGhpcy5pbmNsdXNpb25UcmVlRGVwdGg7XG59O1xuXG5MTm9kZS5wcm90b3R5cGUudHJhbnNmb3JtID0gZnVuY3Rpb24gKHRyYW5zKSB7XG4gIHZhciBsZWZ0ID0gdGhpcy5yZWN0Lng7XG5cbiAgaWYgKGxlZnQgPiBMYXlvdXRDb25zdGFudHMuV09STERfQk9VTkRBUlkpIHtcbiAgICBsZWZ0ID0gTGF5b3V0Q29uc3RhbnRzLldPUkxEX0JPVU5EQVJZO1xuICB9IGVsc2UgaWYgKGxlZnQgPCAtTGF5b3V0Q29uc3RhbnRzLldPUkxEX0JPVU5EQVJZKSB7XG4gICAgbGVmdCA9IC1MYXlvdXRDb25zdGFudHMuV09STERfQk9VTkRBUlk7XG4gIH1cblxuICB2YXIgdG9wID0gdGhpcy5yZWN0Lnk7XG5cbiAgaWYgKHRvcCA+IExheW91dENvbnN0YW50cy5XT1JMRF9CT1VOREFSWSkge1xuICAgIHRvcCA9IExheW91dENvbnN0YW50cy5XT1JMRF9CT1VOREFSWTtcbiAgfSBlbHNlIGlmICh0b3AgPCAtTGF5b3V0Q29uc3RhbnRzLldPUkxEX0JPVU5EQVJZKSB7XG4gICAgdG9wID0gLUxheW91dENvbnN0YW50cy5XT1JMRF9CT1VOREFSWTtcbiAgfVxuXG4gIHZhciBsZWZ0VG9wID0gbmV3IFBvaW50RChsZWZ0LCB0b3ApO1xuICB2YXIgdkxlZnRUb3AgPSB0cmFucy5pbnZlcnNlVHJhbnNmb3JtUG9pbnQobGVmdFRvcCk7XG5cbiAgdGhpcy5zZXRMb2NhdGlvbih2TGVmdFRvcC54LCB2TGVmdFRvcC55KTtcbn07XG5cbkxOb2RlLnByb3RvdHlwZS5nZXRMZWZ0ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5yZWN0Lng7XG59O1xuXG5MTm9kZS5wcm90b3R5cGUuZ2V0UmlnaHQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnJlY3QueCArIHRoaXMucmVjdC53aWR0aDtcbn07XG5cbkxOb2RlLnByb3RvdHlwZS5nZXRUb3AgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnJlY3QueTtcbn07XG5cbkxOb2RlLnByb3RvdHlwZS5nZXRCb3R0b20gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnJlY3QueSArIHRoaXMucmVjdC5oZWlnaHQ7XG59O1xuXG5MTm9kZS5wcm90b3R5cGUuZ2V0UGFyZW50ID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5vd25lciA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gdGhpcy5vd25lci5nZXRQYXJlbnQoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTE5vZGU7XG5cbi8qKiovIH0pLFxuLyogNCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcblxuXG5mdW5jdGlvbiBQb2ludEQoeCwgeSkge1xuICBpZiAoeCA9PSBudWxsICYmIHkgPT0gbnVsbCkge1xuICAgIHRoaXMueCA9IDA7XG4gICAgdGhpcy55ID0gMDtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gIH1cbn1cblxuUG9pbnRELnByb3RvdHlwZS5nZXRYID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy54O1xufTtcblxuUG9pbnRELnByb3RvdHlwZS5nZXRZID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy55O1xufTtcblxuUG9pbnRELnByb3RvdHlwZS5zZXRYID0gZnVuY3Rpb24gKHgpIHtcbiAgdGhpcy54ID0geDtcbn07XG5cblBvaW50RC5wcm90b3R5cGUuc2V0WSA9IGZ1bmN0aW9uICh5KSB7XG4gIHRoaXMueSA9IHk7XG59O1xuXG5Qb2ludEQucHJvdG90eXBlLmdldERpZmZlcmVuY2UgPSBmdW5jdGlvbiAocHQpIHtcbiAgcmV0dXJuIG5ldyBEaW1lbnNpb25EKHRoaXMueCAtIHB0LngsIHRoaXMueSAtIHB0LnkpO1xufTtcblxuUG9pbnRELnByb3RvdHlwZS5nZXRDb3B5ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gbmV3IFBvaW50RCh0aGlzLngsIHRoaXMueSk7XG59O1xuXG5Qb2ludEQucHJvdG90eXBlLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uIChkaW0pIHtcbiAgdGhpcy54ICs9IGRpbS53aWR0aDtcbiAgdGhpcy55ICs9IGRpbS5oZWlnaHQ7XG4gIHJldHVybiB0aGlzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQb2ludEQ7XG5cbi8qKiovIH0pLFxuLyogNSAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcblxuXG52YXIgTEdyYXBoT2JqZWN0ID0gX193ZWJwYWNrX3JlcXVpcmVfXygyKTtcbnZhciBJbnRlZ2VyID0gX193ZWJwYWNrX3JlcXVpcmVfXygxMCk7XG52YXIgTGF5b3V0Q29uc3RhbnRzID0gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcbnZhciBMR3JhcGhNYW5hZ2VyID0gX193ZWJwYWNrX3JlcXVpcmVfXyg2KTtcbnZhciBMTm9kZSA9IF9fd2VicGFja19yZXF1aXJlX18oMyk7XG52YXIgTEVkZ2UgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEpO1xudmFyIFJlY3RhbmdsZUQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEzKTtcbnZhciBQb2ludCA9IF9fd2VicGFja19yZXF1aXJlX18oMTIpO1xudmFyIExpbmtlZExpc3QgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDExKTtcblxuZnVuY3Rpb24gTEdyYXBoKHBhcmVudCwgb2JqMiwgdkdyYXBoKSB7XG4gIExHcmFwaE9iamVjdC5jYWxsKHRoaXMsIHZHcmFwaCk7XG4gIHRoaXMuZXN0aW1hdGVkU2l6ZSA9IEludGVnZXIuTUlOX1ZBTFVFO1xuICB0aGlzLm1hcmdpbiA9IExheW91dENvbnN0YW50cy5ERUZBVUxUX0dSQVBIX01BUkdJTjtcbiAgdGhpcy5lZGdlcyA9IFtdO1xuICB0aGlzLm5vZGVzID0gW107XG4gIHRoaXMuaXNDb25uZWN0ZWQgPSBmYWxzZTtcbiAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG5cbiAgaWYgKG9iajIgIT0gbnVsbCAmJiBvYmoyIGluc3RhbmNlb2YgTEdyYXBoTWFuYWdlcikge1xuICAgIHRoaXMuZ3JhcGhNYW5hZ2VyID0gb2JqMjtcbiAgfSBlbHNlIGlmIChvYmoyICE9IG51bGwgJiYgb2JqMiBpbnN0YW5jZW9mIExheW91dCkge1xuICAgIHRoaXMuZ3JhcGhNYW5hZ2VyID0gb2JqMi5ncmFwaE1hbmFnZXI7XG4gIH1cbn1cblxuTEdyYXBoLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoTEdyYXBoT2JqZWN0LnByb3RvdHlwZSk7XG5mb3IgKHZhciBwcm9wIGluIExHcmFwaE9iamVjdCkge1xuICBMR3JhcGhbcHJvcF0gPSBMR3JhcGhPYmplY3RbcHJvcF07XG59XG5cbkxHcmFwaC5wcm90b3R5cGUuZ2V0Tm9kZXMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLm5vZGVzO1xufTtcblxuTEdyYXBoLnByb3RvdHlwZS5nZXRFZGdlcyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZWRnZXM7XG59O1xuXG5MR3JhcGgucHJvdG90eXBlLmdldEdyYXBoTWFuYWdlciA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZ3JhcGhNYW5hZ2VyO1xufTtcblxuTEdyYXBoLnByb3RvdHlwZS5nZXRQYXJlbnQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnBhcmVudDtcbn07XG5cbkxHcmFwaC5wcm90b3R5cGUuZ2V0TGVmdCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMubGVmdDtcbn07XG5cbkxHcmFwaC5wcm90b3R5cGUuZ2V0UmlnaHQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnJpZ2h0O1xufTtcblxuTEdyYXBoLnByb3RvdHlwZS5nZXRUb3AgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnRvcDtcbn07XG5cbkxHcmFwaC5wcm90b3R5cGUuZ2V0Qm90dG9tID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5ib3R0b207XG59O1xuXG5MR3JhcGgucHJvdG90eXBlLmlzQ29ubmVjdGVkID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5pc0Nvbm5lY3RlZDtcbn07XG5cbkxHcmFwaC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKG9iajEsIHNvdXJjZU5vZGUsIHRhcmdldE5vZGUpIHtcbiAgaWYgKHNvdXJjZU5vZGUgPT0gbnVsbCAmJiB0YXJnZXROb2RlID09IG51bGwpIHtcbiAgICB2YXIgbmV3Tm9kZSA9IG9iajE7XG4gICAgaWYgKHRoaXMuZ3JhcGhNYW5hZ2VyID09IG51bGwpIHtcbiAgICAgIHRocm93IFwiR3JhcGggaGFzIG5vIGdyYXBoIG1nciFcIjtcbiAgICB9XG4gICAgaWYgKHRoaXMuZ2V0Tm9kZXMoKS5pbmRleE9mKG5ld05vZGUpID4gLTEpIHtcbiAgICAgIHRocm93IFwiTm9kZSBhbHJlYWR5IGluIGdyYXBoIVwiO1xuICAgIH1cbiAgICBuZXdOb2RlLm93bmVyID0gdGhpcztcbiAgICB0aGlzLmdldE5vZGVzKCkucHVzaChuZXdOb2RlKTtcblxuICAgIHJldHVybiBuZXdOb2RlO1xuICB9IGVsc2Uge1xuICAgIHZhciBuZXdFZGdlID0gb2JqMTtcbiAgICBpZiAoISh0aGlzLmdldE5vZGVzKCkuaW5kZXhPZihzb3VyY2VOb2RlKSA+IC0xICYmIHRoaXMuZ2V0Tm9kZXMoKS5pbmRleE9mKHRhcmdldE5vZGUpID4gLTEpKSB7XG4gICAgICB0aHJvdyBcIlNvdXJjZSBvciB0YXJnZXQgbm90IGluIGdyYXBoIVwiO1xuICAgIH1cblxuICAgIGlmICghKHNvdXJjZU5vZGUub3duZXIgPT0gdGFyZ2V0Tm9kZS5vd25lciAmJiBzb3VyY2VOb2RlLm93bmVyID09IHRoaXMpKSB7XG4gICAgICB0aHJvdyBcIkJvdGggb3duZXJzIG11c3QgYmUgdGhpcyBncmFwaCFcIjtcbiAgICB9XG5cbiAgICBpZiAoc291cmNlTm9kZS5vd25lciAhPSB0YXJnZXROb2RlLm93bmVyKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBzZXQgc291cmNlIGFuZCB0YXJnZXRcbiAgICBuZXdFZGdlLnNvdXJjZSA9IHNvdXJjZU5vZGU7XG4gICAgbmV3RWRnZS50YXJnZXQgPSB0YXJnZXROb2RlO1xuXG4gICAgLy8gc2V0IGFzIGludHJhLWdyYXBoIGVkZ2VcbiAgICBuZXdFZGdlLmlzSW50ZXJHcmFwaCA9IGZhbHNlO1xuXG4gICAgLy8gYWRkIHRvIGdyYXBoIGVkZ2UgbGlzdFxuICAgIHRoaXMuZ2V0RWRnZXMoKS5wdXNoKG5ld0VkZ2UpO1xuXG4gICAgLy8gYWRkIHRvIGluY2lkZW5jeSBsaXN0c1xuICAgIHNvdXJjZU5vZGUuZWRnZXMucHVzaChuZXdFZGdlKTtcblxuICAgIGlmICh0YXJnZXROb2RlICE9IHNvdXJjZU5vZGUpIHtcbiAgICAgIHRhcmdldE5vZGUuZWRnZXMucHVzaChuZXdFZGdlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3RWRnZTtcbiAgfVxufTtcblxuTEdyYXBoLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHZhciBub2RlID0gb2JqO1xuICBpZiAob2JqIGluc3RhbmNlb2YgTE5vZGUpIHtcbiAgICBpZiAobm9kZSA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBcIk5vZGUgaXMgbnVsbCFcIjtcbiAgICB9XG4gICAgaWYgKCEobm9kZS5vd25lciAhPSBudWxsICYmIG5vZGUub3duZXIgPT0gdGhpcykpIHtcbiAgICAgIHRocm93IFwiT3duZXIgZ3JhcGggaXMgaW52YWxpZCFcIjtcbiAgICB9XG4gICAgaWYgKHRoaXMuZ3JhcGhNYW5hZ2VyID09IG51bGwpIHtcbiAgICAgIHRocm93IFwiT3duZXIgZ3JhcGggbWFuYWdlciBpcyBpbnZhbGlkIVwiO1xuICAgIH1cbiAgICAvLyByZW1vdmUgaW5jaWRlbnQgZWRnZXMgZmlyc3QgKG1ha2UgYSBjb3B5IHRvIGRvIGl0IHNhZmVseSlcbiAgICB2YXIgZWRnZXNUb0JlUmVtb3ZlZCA9IG5vZGUuZWRnZXMuc2xpY2UoKTtcbiAgICB2YXIgZWRnZTtcbiAgICB2YXIgcyA9IGVkZ2VzVG9CZVJlbW92ZWQubGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgczsgaSsrKSB7XG4gICAgICBlZGdlID0gZWRnZXNUb0JlUmVtb3ZlZFtpXTtcblxuICAgICAgaWYgKGVkZ2UuaXNJbnRlckdyYXBoKSB7XG4gICAgICAgIHRoaXMuZ3JhcGhNYW5hZ2VyLnJlbW92ZShlZGdlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVkZ2Uuc291cmNlLm93bmVyLnJlbW92ZShlZGdlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBub3cgdGhlIG5vZGUgaXRzZWxmXG4gICAgdmFyIGluZGV4ID0gdGhpcy5ub2Rlcy5pbmRleE9mKG5vZGUpO1xuICAgIGlmIChpbmRleCA9PSAtMSkge1xuICAgICAgdGhyb3cgXCJOb2RlIG5vdCBpbiBvd25lciBub2RlIGxpc3QhXCI7XG4gICAgfVxuXG4gICAgdGhpcy5ub2Rlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICB9IGVsc2UgaWYgKG9iaiBpbnN0YW5jZW9mIExFZGdlKSB7XG4gICAgdmFyIGVkZ2UgPSBvYmo7XG4gICAgaWYgKGVkZ2UgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgXCJFZGdlIGlzIG51bGwhXCI7XG4gICAgfVxuICAgIGlmICghKGVkZ2Uuc291cmNlICE9IG51bGwgJiYgZWRnZS50YXJnZXQgIT0gbnVsbCkpIHtcbiAgICAgIHRocm93IFwiU291cmNlIGFuZC9vciB0YXJnZXQgaXMgbnVsbCFcIjtcbiAgICB9XG4gICAgaWYgKCEoZWRnZS5zb3VyY2Uub3duZXIgIT0gbnVsbCAmJiBlZGdlLnRhcmdldC5vd25lciAhPSBudWxsICYmIGVkZ2Uuc291cmNlLm93bmVyID09IHRoaXMgJiYgZWRnZS50YXJnZXQub3duZXIgPT0gdGhpcykpIHtcbiAgICAgIHRocm93IFwiU291cmNlIGFuZC9vciB0YXJnZXQgb3duZXIgaXMgaW52YWxpZCFcIjtcbiAgICB9XG5cbiAgICB2YXIgc291cmNlSW5kZXggPSBlZGdlLnNvdXJjZS5lZGdlcy5pbmRleE9mKGVkZ2UpO1xuICAgIHZhciB0YXJnZXRJbmRleCA9IGVkZ2UudGFyZ2V0LmVkZ2VzLmluZGV4T2YoZWRnZSk7XG4gICAgaWYgKCEoc291cmNlSW5kZXggPiAtMSAmJiB0YXJnZXRJbmRleCA+IC0xKSkge1xuICAgICAgdGhyb3cgXCJTb3VyY2UgYW5kL29yIHRhcmdldCBkb2Vzbid0IGtub3cgdGhpcyBlZGdlIVwiO1xuICAgIH1cblxuICAgIGVkZ2Uuc291cmNlLmVkZ2VzLnNwbGljZShzb3VyY2VJbmRleCwgMSk7XG5cbiAgICBpZiAoZWRnZS50YXJnZXQgIT0gZWRnZS5zb3VyY2UpIHtcbiAgICAgIGVkZ2UudGFyZ2V0LmVkZ2VzLnNwbGljZSh0YXJnZXRJbmRleCwgMSk7XG4gICAgfVxuXG4gICAgdmFyIGluZGV4ID0gZWRnZS5zb3VyY2Uub3duZXIuZ2V0RWRnZXMoKS5pbmRleE9mKGVkZ2UpO1xuICAgIGlmIChpbmRleCA9PSAtMSkge1xuICAgICAgdGhyb3cgXCJOb3QgaW4gb3duZXIncyBlZGdlIGxpc3QhXCI7XG4gICAgfVxuXG4gICAgZWRnZS5zb3VyY2Uub3duZXIuZ2V0RWRnZXMoKS5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG59O1xuXG5MR3JhcGgucHJvdG90eXBlLnVwZGF0ZUxlZnRUb3AgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciB0b3AgPSBJbnRlZ2VyLk1BWF9WQUxVRTtcbiAgdmFyIGxlZnQgPSBJbnRlZ2VyLk1BWF9WQUxVRTtcbiAgdmFyIG5vZGVUb3A7XG4gIHZhciBub2RlTGVmdDtcbiAgdmFyIG1hcmdpbjtcblxuICB2YXIgbm9kZXMgPSB0aGlzLmdldE5vZGVzKCk7XG4gIHZhciBzID0gbm9kZXMubGVuZ3RoO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgczsgaSsrKSB7XG4gICAgdmFyIGxOb2RlID0gbm9kZXNbaV07XG4gICAgbm9kZVRvcCA9IGxOb2RlLmdldFRvcCgpO1xuICAgIG5vZGVMZWZ0ID0gbE5vZGUuZ2V0TGVmdCgpO1xuXG4gICAgaWYgKHRvcCA+IG5vZGVUb3ApIHtcbiAgICAgIHRvcCA9IG5vZGVUb3A7XG4gICAgfVxuXG4gICAgaWYgKGxlZnQgPiBub2RlTGVmdCkge1xuICAgICAgbGVmdCA9IG5vZGVMZWZ0O1xuICAgIH1cbiAgfVxuXG4gIC8vIERvIHdlIGhhdmUgYW55IG5vZGVzIGluIHRoaXMgZ3JhcGg/XG4gIGlmICh0b3AgPT0gSW50ZWdlci5NQVhfVkFMVUUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGlmIChub2Rlc1swXS5nZXRQYXJlbnQoKS5wYWRkaW5nTGVmdCAhPSB1bmRlZmluZWQpIHtcbiAgICBtYXJnaW4gPSBub2Rlc1swXS5nZXRQYXJlbnQoKS5wYWRkaW5nTGVmdDtcbiAgfSBlbHNlIHtcbiAgICBtYXJnaW4gPSB0aGlzLm1hcmdpbjtcbiAgfVxuXG4gIHRoaXMubGVmdCA9IGxlZnQgLSBtYXJnaW47XG4gIHRoaXMudG9wID0gdG9wIC0gbWFyZ2luO1xuXG4gIC8vIEFwcGx5IHRoZSBtYXJnaW5zIGFuZCByZXR1cm4gdGhlIHJlc3VsdFxuICByZXR1cm4gbmV3IFBvaW50KHRoaXMubGVmdCwgdGhpcy50b3ApO1xufTtcblxuTEdyYXBoLnByb3RvdHlwZS51cGRhdGVCb3VuZHMgPSBmdW5jdGlvbiAocmVjdXJzaXZlKSB7XG4gIC8vIGNhbGN1bGF0ZSBib3VuZHNcbiAgdmFyIGxlZnQgPSBJbnRlZ2VyLk1BWF9WQUxVRTtcbiAgdmFyIHJpZ2h0ID0gLUludGVnZXIuTUFYX1ZBTFVFO1xuICB2YXIgdG9wID0gSW50ZWdlci5NQVhfVkFMVUU7XG4gIHZhciBib3R0b20gPSAtSW50ZWdlci5NQVhfVkFMVUU7XG4gIHZhciBub2RlTGVmdDtcbiAgdmFyIG5vZGVSaWdodDtcbiAgdmFyIG5vZGVUb3A7XG4gIHZhciBub2RlQm90dG9tO1xuICB2YXIgbWFyZ2luO1xuXG4gIHZhciBub2RlcyA9IHRoaXMubm9kZXM7XG4gIHZhciBzID0gbm9kZXMubGVuZ3RoO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHM7IGkrKykge1xuICAgIHZhciBsTm9kZSA9IG5vZGVzW2ldO1xuXG4gICAgaWYgKHJlY3Vyc2l2ZSAmJiBsTm9kZS5jaGlsZCAhPSBudWxsKSB7XG4gICAgICBsTm9kZS51cGRhdGVCb3VuZHMoKTtcbiAgICB9XG4gICAgbm9kZUxlZnQgPSBsTm9kZS5nZXRMZWZ0KCk7XG4gICAgbm9kZVJpZ2h0ID0gbE5vZGUuZ2V0UmlnaHQoKTtcbiAgICBub2RlVG9wID0gbE5vZGUuZ2V0VG9wKCk7XG4gICAgbm9kZUJvdHRvbSA9IGxOb2RlLmdldEJvdHRvbSgpO1xuXG4gICAgaWYgKGxlZnQgPiBub2RlTGVmdCkge1xuICAgICAgbGVmdCA9IG5vZGVMZWZ0O1xuICAgIH1cblxuICAgIGlmIChyaWdodCA8IG5vZGVSaWdodCkge1xuICAgICAgcmlnaHQgPSBub2RlUmlnaHQ7XG4gICAgfVxuXG4gICAgaWYgKHRvcCA+IG5vZGVUb3ApIHtcbiAgICAgIHRvcCA9IG5vZGVUb3A7XG4gICAgfVxuXG4gICAgaWYgKGJvdHRvbSA8IG5vZGVCb3R0b20pIHtcbiAgICAgIGJvdHRvbSA9IG5vZGVCb3R0b207XG4gICAgfVxuICB9XG5cbiAgdmFyIGJvdW5kaW5nUmVjdCA9IG5ldyBSZWN0YW5nbGVEKGxlZnQsIHRvcCwgcmlnaHQgLSBsZWZ0LCBib3R0b20gLSB0b3ApO1xuICBpZiAobGVmdCA9PSBJbnRlZ2VyLk1BWF9WQUxVRSkge1xuICAgIHRoaXMubGVmdCA9IHRoaXMucGFyZW50LmdldExlZnQoKTtcbiAgICB0aGlzLnJpZ2h0ID0gdGhpcy5wYXJlbnQuZ2V0UmlnaHQoKTtcbiAgICB0aGlzLnRvcCA9IHRoaXMucGFyZW50LmdldFRvcCgpO1xuICAgIHRoaXMuYm90dG9tID0gdGhpcy5wYXJlbnQuZ2V0Qm90dG9tKCk7XG4gIH1cblxuICBpZiAobm9kZXNbMF0uZ2V0UGFyZW50KCkucGFkZGluZ0xlZnQgIT0gdW5kZWZpbmVkKSB7XG4gICAgbWFyZ2luID0gbm9kZXNbMF0uZ2V0UGFyZW50KCkucGFkZGluZ0xlZnQ7XG4gIH0gZWxzZSB7XG4gICAgbWFyZ2luID0gdGhpcy5tYXJnaW47XG4gIH1cblxuICB0aGlzLmxlZnQgPSBib3VuZGluZ1JlY3QueCAtIG1hcmdpbjtcbiAgdGhpcy5yaWdodCA9IGJvdW5kaW5nUmVjdC54ICsgYm91bmRpbmdSZWN0LndpZHRoICsgbWFyZ2luO1xuICB0aGlzLnRvcCA9IGJvdW5kaW5nUmVjdC55IC0gbWFyZ2luO1xuICB0aGlzLmJvdHRvbSA9IGJvdW5kaW5nUmVjdC55ICsgYm91bmRpbmdSZWN0LmhlaWdodCArIG1hcmdpbjtcbn07XG5cbkxHcmFwaC5jYWxjdWxhdGVCb3VuZHMgPSBmdW5jdGlvbiAobm9kZXMpIHtcbiAgdmFyIGxlZnQgPSBJbnRlZ2VyLk1BWF9WQUxVRTtcbiAgdmFyIHJpZ2h0ID0gLUludGVnZXIuTUFYX1ZBTFVFO1xuICB2YXIgdG9wID0gSW50ZWdlci5NQVhfVkFMVUU7XG4gIHZhciBib3R0b20gPSAtSW50ZWdlci5NQVhfVkFMVUU7XG4gIHZhciBub2RlTGVmdDtcbiAgdmFyIG5vZGVSaWdodDtcbiAgdmFyIG5vZGVUb3A7XG4gIHZhciBub2RlQm90dG9tO1xuXG4gIHZhciBzID0gbm9kZXMubGVuZ3RoO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgczsgaSsrKSB7XG4gICAgdmFyIGxOb2RlID0gbm9kZXNbaV07XG4gICAgbm9kZUxlZnQgPSBsTm9kZS5nZXRMZWZ0KCk7XG4gICAgbm9kZVJpZ2h0ID0gbE5vZGUuZ2V0UmlnaHQoKTtcbiAgICBub2RlVG9wID0gbE5vZGUuZ2V0VG9wKCk7XG4gICAgbm9kZUJvdHRvbSA9IGxOb2RlLmdldEJvdHRvbSgpO1xuXG4gICAgaWYgKGxlZnQgPiBub2RlTGVmdCkge1xuICAgICAgbGVmdCA9IG5vZGVMZWZ0O1xuICAgIH1cblxuICAgIGlmIChyaWdodCA8IG5vZGVSaWdodCkge1xuICAgICAgcmlnaHQgPSBub2RlUmlnaHQ7XG4gICAgfVxuXG4gICAgaWYgKHRvcCA+IG5vZGVUb3ApIHtcbiAgICAgIHRvcCA9IG5vZGVUb3A7XG4gICAgfVxuXG4gICAgaWYgKGJvdHRvbSA8IG5vZGVCb3R0b20pIHtcbiAgICAgIGJvdHRvbSA9IG5vZGVCb3R0b207XG4gICAgfVxuICB9XG5cbiAgdmFyIGJvdW5kaW5nUmVjdCA9IG5ldyBSZWN0YW5nbGVEKGxlZnQsIHRvcCwgcmlnaHQgLSBsZWZ0LCBib3R0b20gLSB0b3ApO1xuXG4gIHJldHVybiBib3VuZGluZ1JlY3Q7XG59O1xuXG5MR3JhcGgucHJvdG90eXBlLmdldEluY2x1c2lvblRyZWVEZXB0aCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMgPT0gdGhpcy5ncmFwaE1hbmFnZXIuZ2V0Um9vdCgpKSB7XG4gICAgcmV0dXJuIDE7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRoaXMucGFyZW50LmdldEluY2x1c2lvblRyZWVEZXB0aCgpO1xuICB9XG59O1xuXG5MR3JhcGgucHJvdG90eXBlLmdldEVzdGltYXRlZFNpemUgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmVzdGltYXRlZFNpemUgPT0gSW50ZWdlci5NSU5fVkFMVUUpIHtcbiAgICB0aHJvdyBcImFzc2VydCBmYWlsZWRcIjtcbiAgfVxuICByZXR1cm4gdGhpcy5lc3RpbWF0ZWRTaXplO1xufTtcblxuTEdyYXBoLnByb3RvdHlwZS5jYWxjRXN0aW1hdGVkU2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNpemUgPSAwO1xuICB2YXIgbm9kZXMgPSB0aGlzLm5vZGVzO1xuICB2YXIgcyA9IG5vZGVzLmxlbmd0aDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHM7IGkrKykge1xuICAgIHZhciBsTm9kZSA9IG5vZGVzW2ldO1xuICAgIHNpemUgKz0gbE5vZGUuY2FsY0VzdGltYXRlZFNpemUoKTtcbiAgfVxuXG4gIGlmIChzaXplID09IDApIHtcbiAgICB0aGlzLmVzdGltYXRlZFNpemUgPSBMYXlvdXRDb25zdGFudHMuRU1QVFlfQ09NUE9VTkRfTk9ERV9TSVpFO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuZXN0aW1hdGVkU2l6ZSA9IHNpemUgLyBNYXRoLnNxcnQodGhpcy5ub2Rlcy5sZW5ndGgpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZXN0aW1hdGVkU2l6ZTtcbn07XG5cbkxHcmFwaC5wcm90b3R5cGUudXBkYXRlQ29ubmVjdGVkID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGlmICh0aGlzLm5vZGVzLmxlbmd0aCA9PSAwKSB7XG4gICAgdGhpcy5pc0Nvbm5lY3RlZCA9IHRydWU7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIHF1ZXVlID0gbmV3IExpbmtlZExpc3QoKTtcbiAgdmFyIHZpc2l0ZWQgPSBuZXcgU2V0KCk7XG4gIHZhciBjdXJyZW50Tm9kZSA9IHRoaXMubm9kZXNbMF07XG4gIHZhciBuZWlnaGJvckVkZ2VzO1xuICB2YXIgY3VycmVudE5laWdoYm9yO1xuICB2YXIgY2hpbGRyZW5PZk5vZGUgPSBjdXJyZW50Tm9kZS53aXRoQ2hpbGRyZW4oKTtcbiAgY2hpbGRyZW5PZk5vZGUuZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xuICAgIHF1ZXVlLnB1c2gobm9kZSk7XG4gICAgdmlzaXRlZC5hZGQobm9kZSk7XG4gIH0pO1xuXG4gIHdoaWxlIChxdWV1ZS5sZW5ndGggIT09IDApIHtcbiAgICBjdXJyZW50Tm9kZSA9IHF1ZXVlLnNoaWZ0KCk7XG5cbiAgICAvLyBUcmF2ZXJzZSBhbGwgbmVpZ2hib3JzIG9mIHRoaXMgbm9kZVxuICAgIG5laWdoYm9yRWRnZXMgPSBjdXJyZW50Tm9kZS5nZXRFZGdlcygpO1xuICAgIHZhciBzaXplID0gbmVpZ2hib3JFZGdlcy5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICAgIHZhciBuZWlnaGJvckVkZ2UgPSBuZWlnaGJvckVkZ2VzW2ldO1xuICAgICAgY3VycmVudE5laWdoYm9yID0gbmVpZ2hib3JFZGdlLmdldE90aGVyRW5kSW5HcmFwaChjdXJyZW50Tm9kZSwgdGhpcyk7XG5cbiAgICAgIC8vIEFkZCB1bnZpc2l0ZWQgbmVpZ2hib3JzIHRvIHRoZSBsaXN0IHRvIHZpc2l0XG4gICAgICBpZiAoY3VycmVudE5laWdoYm9yICE9IG51bGwgJiYgIXZpc2l0ZWQuaGFzKGN1cnJlbnROZWlnaGJvcikpIHtcbiAgICAgICAgdmFyIGNoaWxkcmVuT2ZOZWlnaGJvciA9IGN1cnJlbnROZWlnaGJvci53aXRoQ2hpbGRyZW4oKTtcblxuICAgICAgICBjaGlsZHJlbk9mTmVpZ2hib3IuZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgIHF1ZXVlLnB1c2gobm9kZSk7XG4gICAgICAgICAgdmlzaXRlZC5hZGQobm9kZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRoaXMuaXNDb25uZWN0ZWQgPSBmYWxzZTtcblxuICBpZiAodmlzaXRlZC5zaXplID49IHRoaXMubm9kZXMubGVuZ3RoKSB7XG4gICAgdmFyIG5vT2ZWaXNpdGVkSW5UaGlzR3JhcGggPSAwO1xuXG4gICAgdmlzaXRlZC5mb3JFYWNoKGZ1bmN0aW9uICh2aXNpdGVkTm9kZSkge1xuICAgICAgaWYgKHZpc2l0ZWROb2RlLm93bmVyID09IHNlbGYpIHtcbiAgICAgICAgbm9PZlZpc2l0ZWRJblRoaXNHcmFwaCsrO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKG5vT2ZWaXNpdGVkSW5UaGlzR3JhcGggPT0gdGhpcy5ub2Rlcy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuaXNDb25uZWN0ZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMR3JhcGg7XG5cbi8qKiovIH0pLFxuLyogNiAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcblxuXG52YXIgTEdyYXBoO1xudmFyIExFZGdlID0gX193ZWJwYWNrX3JlcXVpcmVfXygxKTtcblxuZnVuY3Rpb24gTEdyYXBoTWFuYWdlcihsYXlvdXQpIHtcbiAgTEdyYXBoID0gX193ZWJwYWNrX3JlcXVpcmVfXyg1KTsgLy8gSXQgbWF5IGJlIGJldHRlciB0byBpbml0aWxpemUgdGhpcyBvdXQgb2YgdGhpcyBmdW5jdGlvbiBidXQgaXQgZ2l2ZXMgYW4gZXJyb3IgKFJpZ2h0LWhhbmQgc2lkZSBvZiAnaW5zdGFuY2VvZicgaXMgbm90IGNhbGxhYmxlKSBub3cuXG4gIHRoaXMubGF5b3V0ID0gbGF5b3V0O1xuXG4gIHRoaXMuZ3JhcGhzID0gW107XG4gIHRoaXMuZWRnZXMgPSBbXTtcbn1cblxuTEdyYXBoTWFuYWdlci5wcm90b3R5cGUuYWRkUm9vdCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG5ncmFwaCA9IHRoaXMubGF5b3V0Lm5ld0dyYXBoKCk7XG4gIHZhciBubm9kZSA9IHRoaXMubGF5b3V0Lm5ld05vZGUobnVsbCk7XG4gIHZhciByb290ID0gdGhpcy5hZGQobmdyYXBoLCBubm9kZSk7XG4gIHRoaXMuc2V0Um9vdEdyYXBoKHJvb3QpO1xuICByZXR1cm4gdGhpcy5yb290R3JhcGg7XG59O1xuXG5MR3JhcGhNYW5hZ2VyLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAobmV3R3JhcGgsIHBhcmVudE5vZGUsIG5ld0VkZ2UsIHNvdXJjZU5vZGUsIHRhcmdldE5vZGUpIHtcbiAgLy90aGVyZSBhcmUganVzdCAyIHBhcmFtZXRlcnMgYXJlIHBhc3NlZCB0aGVuIGl0IGFkZHMgYW4gTEdyYXBoIGVsc2UgaXQgYWRkcyBhbiBMRWRnZVxuICBpZiAobmV3RWRnZSA9PSBudWxsICYmIHNvdXJjZU5vZGUgPT0gbnVsbCAmJiB0YXJnZXROb2RlID09IG51bGwpIHtcbiAgICBpZiAobmV3R3JhcGggPT0gbnVsbCkge1xuICAgICAgdGhyb3cgXCJHcmFwaCBpcyBudWxsIVwiO1xuICAgIH1cbiAgICBpZiAocGFyZW50Tm9kZSA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBcIlBhcmVudCBub2RlIGlzIG51bGwhXCI7XG4gICAgfVxuICAgIGlmICh0aGlzLmdyYXBocy5pbmRleE9mKG5ld0dyYXBoKSA+IC0xKSB7XG4gICAgICB0aHJvdyBcIkdyYXBoIGFscmVhZHkgaW4gdGhpcyBncmFwaCBtZ3IhXCI7XG4gICAgfVxuXG4gICAgdGhpcy5ncmFwaHMucHVzaChuZXdHcmFwaCk7XG5cbiAgICBpZiAobmV3R3JhcGgucGFyZW50ICE9IG51bGwpIHtcbiAgICAgIHRocm93IFwiQWxyZWFkeSBoYXMgYSBwYXJlbnQhXCI7XG4gICAgfVxuICAgIGlmIChwYXJlbnROb2RlLmNoaWxkICE9IG51bGwpIHtcbiAgICAgIHRocm93IFwiQWxyZWFkeSBoYXMgYSBjaGlsZCFcIjtcbiAgICB9XG5cbiAgICBuZXdHcmFwaC5wYXJlbnQgPSBwYXJlbnROb2RlO1xuICAgIHBhcmVudE5vZGUuY2hpbGQgPSBuZXdHcmFwaDtcblxuICAgIHJldHVybiBuZXdHcmFwaDtcbiAgfSBlbHNlIHtcbiAgICAvL2NoYW5nZSB0aGUgb3JkZXIgb2YgdGhlIHBhcmFtZXRlcnNcbiAgICB0YXJnZXROb2RlID0gbmV3RWRnZTtcbiAgICBzb3VyY2VOb2RlID0gcGFyZW50Tm9kZTtcbiAgICBuZXdFZGdlID0gbmV3R3JhcGg7XG4gICAgdmFyIHNvdXJjZUdyYXBoID0gc291cmNlTm9kZS5nZXRPd25lcigpO1xuICAgIHZhciB0YXJnZXRHcmFwaCA9IHRhcmdldE5vZGUuZ2V0T3duZXIoKTtcblxuICAgIGlmICghKHNvdXJjZUdyYXBoICE9IG51bGwgJiYgc291cmNlR3JhcGguZ2V0R3JhcGhNYW5hZ2VyKCkgPT0gdGhpcykpIHtcbiAgICAgIHRocm93IFwiU291cmNlIG5vdCBpbiB0aGlzIGdyYXBoIG1nciFcIjtcbiAgICB9XG4gICAgaWYgKCEodGFyZ2V0R3JhcGggIT0gbnVsbCAmJiB0YXJnZXRHcmFwaC5nZXRHcmFwaE1hbmFnZXIoKSA9PSB0aGlzKSkge1xuICAgICAgdGhyb3cgXCJUYXJnZXQgbm90IGluIHRoaXMgZ3JhcGggbWdyIVwiO1xuICAgIH1cblxuICAgIGlmIChzb3VyY2VHcmFwaCA9PSB0YXJnZXRHcmFwaCkge1xuICAgICAgbmV3RWRnZS5pc0ludGVyR3JhcGggPSBmYWxzZTtcbiAgICAgIHJldHVybiBzb3VyY2VHcmFwaC5hZGQobmV3RWRnZSwgc291cmNlTm9kZSwgdGFyZ2V0Tm9kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5ld0VkZ2UuaXNJbnRlckdyYXBoID0gdHJ1ZTtcblxuICAgICAgLy8gc2V0IHNvdXJjZSBhbmQgdGFyZ2V0XG4gICAgICBuZXdFZGdlLnNvdXJjZSA9IHNvdXJjZU5vZGU7XG4gICAgICBuZXdFZGdlLnRhcmdldCA9IHRhcmdldE5vZGU7XG5cbiAgICAgIC8vIGFkZCBlZGdlIHRvIGludGVyLWdyYXBoIGVkZ2UgbGlzdFxuICAgICAgaWYgKHRoaXMuZWRnZXMuaW5kZXhPZihuZXdFZGdlKSA+IC0xKSB7XG4gICAgICAgIHRocm93IFwiRWRnZSBhbHJlYWR5IGluIGludGVyLWdyYXBoIGVkZ2UgbGlzdCFcIjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5lZGdlcy5wdXNoKG5ld0VkZ2UpO1xuXG4gICAgICAvLyBhZGQgZWRnZSB0byBzb3VyY2UgYW5kIHRhcmdldCBpbmNpZGVuY3kgbGlzdHNcbiAgICAgIGlmICghKG5ld0VkZ2Uuc291cmNlICE9IG51bGwgJiYgbmV3RWRnZS50YXJnZXQgIT0gbnVsbCkpIHtcbiAgICAgICAgdGhyb3cgXCJFZGdlIHNvdXJjZSBhbmQvb3IgdGFyZ2V0IGlzIG51bGwhXCI7XG4gICAgICB9XG5cbiAgICAgIGlmICghKG5ld0VkZ2Uuc291cmNlLmVkZ2VzLmluZGV4T2YobmV3RWRnZSkgPT0gLTEgJiYgbmV3RWRnZS50YXJnZXQuZWRnZXMuaW5kZXhPZihuZXdFZGdlKSA9PSAtMSkpIHtcbiAgICAgICAgdGhyb3cgXCJFZGdlIGFscmVhZHkgaW4gc291cmNlIGFuZC9vciB0YXJnZXQgaW5jaWRlbmN5IGxpc3QhXCI7XG4gICAgICB9XG5cbiAgICAgIG5ld0VkZ2Uuc291cmNlLmVkZ2VzLnB1c2gobmV3RWRnZSk7XG4gICAgICBuZXdFZGdlLnRhcmdldC5lZGdlcy5wdXNoKG5ld0VkZ2UpO1xuXG4gICAgICByZXR1cm4gbmV3RWRnZTtcbiAgICB9XG4gIH1cbn07XG5cbkxHcmFwaE1hbmFnZXIucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChsT2JqKSB7XG4gIGlmIChsT2JqIGluc3RhbmNlb2YgTEdyYXBoKSB7XG4gICAgdmFyIGdyYXBoID0gbE9iajtcbiAgICBpZiAoZ3JhcGguZ2V0R3JhcGhNYW5hZ2VyKCkgIT0gdGhpcykge1xuICAgICAgdGhyb3cgXCJHcmFwaCBub3QgaW4gdGhpcyBncmFwaCBtZ3JcIjtcbiAgICB9XG4gICAgaWYgKCEoZ3JhcGggPT0gdGhpcy5yb290R3JhcGggfHwgZ3JhcGgucGFyZW50ICE9IG51bGwgJiYgZ3JhcGgucGFyZW50LmdyYXBoTWFuYWdlciA9PSB0aGlzKSkge1xuICAgICAgdGhyb3cgXCJJbnZhbGlkIHBhcmVudCBub2RlIVwiO1xuICAgIH1cblxuICAgIC8vIGZpcnN0IHRoZSBlZGdlcyAobWFrZSBhIGNvcHkgdG8gZG8gaXQgc2FmZWx5KVxuICAgIHZhciBlZGdlc1RvQmVSZW1vdmVkID0gW107XG5cbiAgICBlZGdlc1RvQmVSZW1vdmVkID0gZWRnZXNUb0JlUmVtb3ZlZC5jb25jYXQoZ3JhcGguZ2V0RWRnZXMoKSk7XG5cbiAgICB2YXIgZWRnZTtcbiAgICB2YXIgcyA9IGVkZ2VzVG9CZVJlbW92ZWQubGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgczsgaSsrKSB7XG4gICAgICBlZGdlID0gZWRnZXNUb0JlUmVtb3ZlZFtpXTtcbiAgICAgIGdyYXBoLnJlbW92ZShlZGdlKTtcbiAgICB9XG5cbiAgICAvLyB0aGVuIHRoZSBub2RlcyAobWFrZSBhIGNvcHkgdG8gZG8gaXQgc2FmZWx5KVxuICAgIHZhciBub2Rlc1RvQmVSZW1vdmVkID0gW107XG5cbiAgICBub2Rlc1RvQmVSZW1vdmVkID0gbm9kZXNUb0JlUmVtb3ZlZC5jb25jYXQoZ3JhcGguZ2V0Tm9kZXMoKSk7XG5cbiAgICB2YXIgbm9kZTtcbiAgICBzID0gbm9kZXNUb0JlUmVtb3ZlZC5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzOyBpKyspIHtcbiAgICAgIG5vZGUgPSBub2Rlc1RvQmVSZW1vdmVkW2ldO1xuICAgICAgZ3JhcGgucmVtb3ZlKG5vZGUpO1xuICAgIH1cblxuICAgIC8vIGNoZWNrIGlmIGdyYXBoIGlzIHRoZSByb290XG4gICAgaWYgKGdyYXBoID09IHRoaXMucm9vdEdyYXBoKSB7XG4gICAgICB0aGlzLnNldFJvb3RHcmFwaChudWxsKTtcbiAgICB9XG5cbiAgICAvLyBub3cgcmVtb3ZlIHRoZSBncmFwaCBpdHNlbGZcbiAgICB2YXIgaW5kZXggPSB0aGlzLmdyYXBocy5pbmRleE9mKGdyYXBoKTtcbiAgICB0aGlzLmdyYXBocy5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgLy8gYWxzbyByZXNldCB0aGUgcGFyZW50IG9mIHRoZSBncmFwaFxuICAgIGdyYXBoLnBhcmVudCA9IG51bGw7XG4gIH0gZWxzZSBpZiAobE9iaiBpbnN0YW5jZW9mIExFZGdlKSB7XG4gICAgZWRnZSA9IGxPYmo7XG4gICAgaWYgKGVkZ2UgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgXCJFZGdlIGlzIG51bGwhXCI7XG4gICAgfVxuICAgIGlmICghZWRnZS5pc0ludGVyR3JhcGgpIHtcbiAgICAgIHRocm93IFwiTm90IGFuIGludGVyLWdyYXBoIGVkZ2UhXCI7XG4gICAgfVxuICAgIGlmICghKGVkZ2Uuc291cmNlICE9IG51bGwgJiYgZWRnZS50YXJnZXQgIT0gbnVsbCkpIHtcbiAgICAgIHRocm93IFwiU291cmNlIGFuZC9vciB0YXJnZXQgaXMgbnVsbCFcIjtcbiAgICB9XG5cbiAgICAvLyByZW1vdmUgZWRnZSBmcm9tIHNvdXJjZSBhbmQgdGFyZ2V0IG5vZGVzJyBpbmNpZGVuY3kgbGlzdHNcblxuICAgIGlmICghKGVkZ2Uuc291cmNlLmVkZ2VzLmluZGV4T2YoZWRnZSkgIT0gLTEgJiYgZWRnZS50YXJnZXQuZWRnZXMuaW5kZXhPZihlZGdlKSAhPSAtMSkpIHtcbiAgICAgIHRocm93IFwiU291cmNlIGFuZC9vciB0YXJnZXQgZG9lc24ndCBrbm93IHRoaXMgZWRnZSFcIjtcbiAgICB9XG5cbiAgICB2YXIgaW5kZXggPSBlZGdlLnNvdXJjZS5lZGdlcy5pbmRleE9mKGVkZ2UpO1xuICAgIGVkZ2Uuc291cmNlLmVkZ2VzLnNwbGljZShpbmRleCwgMSk7XG4gICAgaW5kZXggPSBlZGdlLnRhcmdldC5lZGdlcy5pbmRleE9mKGVkZ2UpO1xuICAgIGVkZ2UudGFyZ2V0LmVkZ2VzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICAvLyByZW1vdmUgZWRnZSBmcm9tIG93bmVyIGdyYXBoIG1hbmFnZXIncyBpbnRlci1ncmFwaCBlZGdlIGxpc3RcblxuICAgIGlmICghKGVkZ2Uuc291cmNlLm93bmVyICE9IG51bGwgJiYgZWRnZS5zb3VyY2Uub3duZXIuZ2V0R3JhcGhNYW5hZ2VyKCkgIT0gbnVsbCkpIHtcbiAgICAgIHRocm93IFwiRWRnZSBvd25lciBncmFwaCBvciBvd25lciBncmFwaCBtYW5hZ2VyIGlzIG51bGwhXCI7XG4gICAgfVxuICAgIGlmIChlZGdlLnNvdXJjZS5vd25lci5nZXRHcmFwaE1hbmFnZXIoKS5lZGdlcy5pbmRleE9mKGVkZ2UpID09IC0xKSB7XG4gICAgICB0aHJvdyBcIk5vdCBpbiBvd25lciBncmFwaCBtYW5hZ2VyJ3MgZWRnZSBsaXN0IVwiO1xuICAgIH1cblxuICAgIHZhciBpbmRleCA9IGVkZ2Uuc291cmNlLm93bmVyLmdldEdyYXBoTWFuYWdlcigpLmVkZ2VzLmluZGV4T2YoZWRnZSk7XG4gICAgZWRnZS5zb3VyY2Uub3duZXIuZ2V0R3JhcGhNYW5hZ2VyKCkuZWRnZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgfVxufTtcblxuTEdyYXBoTWFuYWdlci5wcm90b3R5cGUudXBkYXRlQm91bmRzID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnJvb3RHcmFwaC51cGRhdGVCb3VuZHModHJ1ZSk7XG59O1xuXG5MR3JhcGhNYW5hZ2VyLnByb3RvdHlwZS5nZXRHcmFwaHMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmdyYXBocztcbn07XG5cbkxHcmFwaE1hbmFnZXIucHJvdG90eXBlLmdldEFsbE5vZGVzID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5hbGxOb2RlcyA9PSBudWxsKSB7XG4gICAgdmFyIG5vZGVMaXN0ID0gW107XG4gICAgdmFyIGdyYXBocyA9IHRoaXMuZ2V0R3JhcGhzKCk7XG4gICAgdmFyIHMgPSBncmFwaHMubGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgczsgaSsrKSB7XG4gICAgICBub2RlTGlzdCA9IG5vZGVMaXN0LmNvbmNhdChncmFwaHNbaV0uZ2V0Tm9kZXMoKSk7XG4gICAgfVxuICAgIHRoaXMuYWxsTm9kZXMgPSBub2RlTGlzdDtcbiAgfVxuICByZXR1cm4gdGhpcy5hbGxOb2Rlcztcbn07XG5cbkxHcmFwaE1hbmFnZXIucHJvdG90eXBlLnJlc2V0QWxsTm9kZXMgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuYWxsTm9kZXMgPSBudWxsO1xufTtcblxuTEdyYXBoTWFuYWdlci5wcm90b3R5cGUucmVzZXRBbGxFZGdlcyA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5hbGxFZGdlcyA9IG51bGw7XG59O1xuXG5MR3JhcGhNYW5hZ2VyLnByb3RvdHlwZS5yZXNldEFsbE5vZGVzVG9BcHBseUdyYXZpdGF0aW9uID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmFsbE5vZGVzVG9BcHBseUdyYXZpdGF0aW9uID0gbnVsbDtcbn07XG5cbkxHcmFwaE1hbmFnZXIucHJvdG90eXBlLmdldEFsbEVkZ2VzID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5hbGxFZGdlcyA9PSBudWxsKSB7XG4gICAgdmFyIGVkZ2VMaXN0ID0gW107XG4gICAgdmFyIGdyYXBocyA9IHRoaXMuZ2V0R3JhcGhzKCk7XG4gICAgdmFyIHMgPSBncmFwaHMubGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ3JhcGhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBlZGdlTGlzdCA9IGVkZ2VMaXN0LmNvbmNhdChncmFwaHNbaV0uZ2V0RWRnZXMoKSk7XG4gICAgfVxuXG4gICAgZWRnZUxpc3QgPSBlZGdlTGlzdC5jb25jYXQodGhpcy5lZGdlcyk7XG5cbiAgICB0aGlzLmFsbEVkZ2VzID0gZWRnZUxpc3Q7XG4gIH1cbiAgcmV0dXJuIHRoaXMuYWxsRWRnZXM7XG59O1xuXG5MR3JhcGhNYW5hZ2VyLnByb3RvdHlwZS5nZXRBbGxOb2Rlc1RvQXBwbHlHcmF2aXRhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuYWxsTm9kZXNUb0FwcGx5R3Jhdml0YXRpb247XG59O1xuXG5MR3JhcGhNYW5hZ2VyLnByb3RvdHlwZS5zZXRBbGxOb2Rlc1RvQXBwbHlHcmF2aXRhdGlvbiA9IGZ1bmN0aW9uIChub2RlTGlzdCkge1xuICBpZiAodGhpcy5hbGxOb2Rlc1RvQXBwbHlHcmF2aXRhdGlvbiAhPSBudWxsKSB7XG4gICAgdGhyb3cgXCJhc3NlcnQgZmFpbGVkXCI7XG4gIH1cblxuICB0aGlzLmFsbE5vZGVzVG9BcHBseUdyYXZpdGF0aW9uID0gbm9kZUxpc3Q7XG59O1xuXG5MR3JhcGhNYW5hZ2VyLnByb3RvdHlwZS5nZXRSb290ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5yb290R3JhcGg7XG59O1xuXG5MR3JhcGhNYW5hZ2VyLnByb3RvdHlwZS5zZXRSb290R3JhcGggPSBmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgaWYgKGdyYXBoLmdldEdyYXBoTWFuYWdlcigpICE9IHRoaXMpIHtcbiAgICB0aHJvdyBcIlJvb3Qgbm90IGluIHRoaXMgZ3JhcGggbWdyIVwiO1xuICB9XG5cbiAgdGhpcy5yb290R3JhcGggPSBncmFwaDtcbiAgLy8gcm9vdCBncmFwaCBtdXN0IGhhdmUgYSByb290IG5vZGUgYXNzb2NpYXRlZCB3aXRoIGl0IGZvciBjb252ZW5pZW5jZVxuICBpZiAoZ3JhcGgucGFyZW50ID09IG51bGwpIHtcbiAgICBncmFwaC5wYXJlbnQgPSB0aGlzLmxheW91dC5uZXdOb2RlKFwiUm9vdCBub2RlXCIpO1xuICB9XG59O1xuXG5MR3JhcGhNYW5hZ2VyLnByb3RvdHlwZS5nZXRMYXlvdXQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmxheW91dDtcbn07XG5cbkxHcmFwaE1hbmFnZXIucHJvdG90eXBlLmlzT25lQW5jZXN0b3JPZk90aGVyID0gZnVuY3Rpb24gKGZpcnN0Tm9kZSwgc2Vjb25kTm9kZSkge1xuICBpZiAoIShmaXJzdE5vZGUgIT0gbnVsbCAmJiBzZWNvbmROb2RlICE9IG51bGwpKSB7XG4gICAgdGhyb3cgXCJhc3NlcnQgZmFpbGVkXCI7XG4gIH1cblxuICBpZiAoZmlyc3ROb2RlID09IHNlY29uZE5vZGUpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICAvLyBJcyBzZWNvbmQgbm9kZSBhbiBhbmNlc3RvciBvZiB0aGUgZmlyc3Qgb25lP1xuICB2YXIgb3duZXJHcmFwaCA9IGZpcnN0Tm9kZS5nZXRPd25lcigpO1xuICB2YXIgcGFyZW50Tm9kZTtcblxuICBkbyB7XG4gICAgcGFyZW50Tm9kZSA9IG93bmVyR3JhcGguZ2V0UGFyZW50KCk7XG5cbiAgICBpZiAocGFyZW50Tm9kZSA9PSBudWxsKSB7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAocGFyZW50Tm9kZSA9PSBzZWNvbmROb2RlKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBvd25lckdyYXBoID0gcGFyZW50Tm9kZS5nZXRPd25lcigpO1xuICAgIGlmIChvd25lckdyYXBoID09IG51bGwpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfSB3aGlsZSAodHJ1ZSk7XG4gIC8vIElzIGZpcnN0IG5vZGUgYW4gYW5jZXN0b3Igb2YgdGhlIHNlY29uZCBvbmU/XG4gIG93bmVyR3JhcGggPSBzZWNvbmROb2RlLmdldE93bmVyKCk7XG5cbiAgZG8ge1xuICAgIHBhcmVudE5vZGUgPSBvd25lckdyYXBoLmdldFBhcmVudCgpO1xuXG4gICAgaWYgKHBhcmVudE5vZGUgPT0gbnVsbCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKHBhcmVudE5vZGUgPT0gZmlyc3ROb2RlKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBvd25lckdyYXBoID0gcGFyZW50Tm9kZS5nZXRPd25lcigpO1xuICAgIGlmIChvd25lckdyYXBoID09IG51bGwpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfSB3aGlsZSAodHJ1ZSk7XG5cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuTEdyYXBoTWFuYWdlci5wcm90b3R5cGUuY2FsY0xvd2VzdENvbW1vbkFuY2VzdG9ycyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGVkZ2U7XG4gIHZhciBzb3VyY2VOb2RlO1xuICB2YXIgdGFyZ2V0Tm9kZTtcbiAgdmFyIHNvdXJjZUFuY2VzdG9yR3JhcGg7XG4gIHZhciB0YXJnZXRBbmNlc3RvckdyYXBoO1xuXG4gIHZhciBlZGdlcyA9IHRoaXMuZ2V0QWxsRWRnZXMoKTtcbiAgdmFyIHMgPSBlZGdlcy5sZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgczsgaSsrKSB7XG4gICAgZWRnZSA9IGVkZ2VzW2ldO1xuXG4gICAgc291cmNlTm9kZSA9IGVkZ2Uuc291cmNlO1xuICAgIHRhcmdldE5vZGUgPSBlZGdlLnRhcmdldDtcbiAgICBlZGdlLmxjYSA9IG51bGw7XG4gICAgZWRnZS5zb3VyY2VJbkxjYSA9IHNvdXJjZU5vZGU7XG4gICAgZWRnZS50YXJnZXRJbkxjYSA9IHRhcmdldE5vZGU7XG5cbiAgICBpZiAoc291cmNlTm9kZSA9PSB0YXJnZXROb2RlKSB7XG4gICAgICBlZGdlLmxjYSA9IHNvdXJjZU5vZGUuZ2V0T3duZXIoKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHNvdXJjZUFuY2VzdG9yR3JhcGggPSBzb3VyY2VOb2RlLmdldE93bmVyKCk7XG5cbiAgICB3aGlsZSAoZWRnZS5sY2EgPT0gbnVsbCkge1xuICAgICAgZWRnZS50YXJnZXRJbkxjYSA9IHRhcmdldE5vZGU7XG4gICAgICB0YXJnZXRBbmNlc3RvckdyYXBoID0gdGFyZ2V0Tm9kZS5nZXRPd25lcigpO1xuXG4gICAgICB3aGlsZSAoZWRnZS5sY2EgPT0gbnVsbCkge1xuICAgICAgICBpZiAodGFyZ2V0QW5jZXN0b3JHcmFwaCA9PSBzb3VyY2VBbmNlc3RvckdyYXBoKSB7XG4gICAgICAgICAgZWRnZS5sY2EgPSB0YXJnZXRBbmNlc3RvckdyYXBoO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRhcmdldEFuY2VzdG9yR3JhcGggPT0gdGhpcy5yb290R3JhcGgpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlZGdlLmxjYSAhPSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgXCJhc3NlcnQgZmFpbGVkXCI7XG4gICAgICAgIH1cbiAgICAgICAgZWRnZS50YXJnZXRJbkxjYSA9IHRhcmdldEFuY2VzdG9yR3JhcGguZ2V0UGFyZW50KCk7XG4gICAgICAgIHRhcmdldEFuY2VzdG9yR3JhcGggPSBlZGdlLnRhcmdldEluTGNhLmdldE93bmVyKCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzb3VyY2VBbmNlc3RvckdyYXBoID09IHRoaXMucm9vdEdyYXBoKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBpZiAoZWRnZS5sY2EgPT0gbnVsbCkge1xuICAgICAgICBlZGdlLnNvdXJjZUluTGNhID0gc291cmNlQW5jZXN0b3JHcmFwaC5nZXRQYXJlbnQoKTtcbiAgICAgICAgc291cmNlQW5jZXN0b3JHcmFwaCA9IGVkZ2Uuc291cmNlSW5MY2EuZ2V0T3duZXIoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZWRnZS5sY2EgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgXCJhc3NlcnQgZmFpbGVkXCI7XG4gICAgfVxuICB9XG59O1xuXG5MR3JhcGhNYW5hZ2VyLnByb3RvdHlwZS5jYWxjTG93ZXN0Q29tbW9uQW5jZXN0b3IgPSBmdW5jdGlvbiAoZmlyc3ROb2RlLCBzZWNvbmROb2RlKSB7XG4gIGlmIChmaXJzdE5vZGUgPT0gc2Vjb25kTm9kZSkge1xuICAgIHJldHVybiBmaXJzdE5vZGUuZ2V0T3duZXIoKTtcbiAgfVxuICB2YXIgZmlyc3RPd25lckdyYXBoID0gZmlyc3ROb2RlLmdldE93bmVyKCk7XG5cbiAgZG8ge1xuICAgIGlmIChmaXJzdE93bmVyR3JhcGggPT0gbnVsbCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHZhciBzZWNvbmRPd25lckdyYXBoID0gc2Vjb25kTm9kZS5nZXRPd25lcigpO1xuXG4gICAgZG8ge1xuICAgICAgaWYgKHNlY29uZE93bmVyR3JhcGggPT0gbnVsbCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgaWYgKHNlY29uZE93bmVyR3JhcGggPT0gZmlyc3RPd25lckdyYXBoKSB7XG4gICAgICAgIHJldHVybiBzZWNvbmRPd25lckdyYXBoO1xuICAgICAgfVxuICAgICAgc2Vjb25kT3duZXJHcmFwaCA9IHNlY29uZE93bmVyR3JhcGguZ2V0UGFyZW50KCkuZ2V0T3duZXIoKTtcbiAgICB9IHdoaWxlICh0cnVlKTtcblxuICAgIGZpcnN0T3duZXJHcmFwaCA9IGZpcnN0T3duZXJHcmFwaC5nZXRQYXJlbnQoKS5nZXRPd25lcigpO1xuICB9IHdoaWxlICh0cnVlKTtcblxuICByZXR1cm4gZmlyc3RPd25lckdyYXBoO1xufTtcblxuTEdyYXBoTWFuYWdlci5wcm90b3R5cGUuY2FsY0luY2x1c2lvblRyZWVEZXB0aHMgPSBmdW5jdGlvbiAoZ3JhcGgsIGRlcHRoKSB7XG4gIGlmIChncmFwaCA9PSBudWxsICYmIGRlcHRoID09IG51bGwpIHtcbiAgICBncmFwaCA9IHRoaXMucm9vdEdyYXBoO1xuICAgIGRlcHRoID0gMTtcbiAgfVxuICB2YXIgbm9kZTtcblxuICB2YXIgbm9kZXMgPSBncmFwaC5nZXROb2RlcygpO1xuICB2YXIgcyA9IG5vZGVzLmxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzOyBpKyspIHtcbiAgICBub2RlID0gbm9kZXNbaV07XG4gICAgbm9kZS5pbmNsdXNpb25UcmVlRGVwdGggPSBkZXB0aDtcblxuICAgIGlmIChub2RlLmNoaWxkICE9IG51bGwpIHtcbiAgICAgIHRoaXMuY2FsY0luY2x1c2lvblRyZWVEZXB0aHMobm9kZS5jaGlsZCwgZGVwdGggKyAxKTtcbiAgICB9XG4gIH1cbn07XG5cbkxHcmFwaE1hbmFnZXIucHJvdG90eXBlLmluY2x1ZGVzSW52YWxpZEVkZ2UgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBlZGdlO1xuXG4gIHZhciBzID0gdGhpcy5lZGdlcy5sZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgczsgaSsrKSB7XG4gICAgZWRnZSA9IHRoaXMuZWRnZXNbaV07XG5cbiAgICBpZiAodGhpcy5pc09uZUFuY2VzdG9yT2ZPdGhlcihlZGdlLnNvdXJjZSwgZWRnZS50YXJnZXQpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMR3JhcGhNYW5hZ2VyO1xuXG4vKioqLyB9KSxcbi8qIDcgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cblxudmFyIExheW91dENvbnN0YW50cyA9IF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cbmZ1bmN0aW9uIEZETGF5b3V0Q29uc3RhbnRzKCkge31cblxuLy9GRExheW91dENvbnN0YW50cyBpbmhlcml0cyBzdGF0aWMgcHJvcHMgaW4gTGF5b3V0Q29uc3RhbnRzXG5mb3IgKHZhciBwcm9wIGluIExheW91dENvbnN0YW50cykge1xuICBGRExheW91dENvbnN0YW50c1twcm9wXSA9IExheW91dENvbnN0YW50c1twcm9wXTtcbn1cblxuRkRMYXlvdXRDb25zdGFudHMuTUFYX0lURVJBVElPTlMgPSAyNTAwO1xuXG5GRExheW91dENvbnN0YW50cy5ERUZBVUxUX0VER0VfTEVOR1RIID0gNTA7XG5GRExheW91dENvbnN0YW50cy5ERUZBVUxUX1NQUklOR19TVFJFTkdUSCA9IDAuNDU7XG5GRExheW91dENvbnN0YW50cy5ERUZBVUxUX1JFUFVMU0lPTl9TVFJFTkdUSCA9IDQ1MDAuMDtcbkZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfR1JBVklUWV9TVFJFTkdUSCA9IDAuNDtcbkZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfQ09NUE9VTkRfR1JBVklUWV9TVFJFTkdUSCA9IDEuMDtcbkZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfR1JBVklUWV9SQU5HRV9GQUNUT1IgPSAzLjg7XG5GRExheW91dENvbnN0YW50cy5ERUZBVUxUX0NPTVBPVU5EX0dSQVZJVFlfUkFOR0VfRkFDVE9SID0gMS41O1xuRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9VU0VfU01BUlRfSURFQUxfRURHRV9MRU5HVEhfQ0FMQ1VMQVRJT04gPSB0cnVlO1xuRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9VU0VfU01BUlRfUkVQVUxTSU9OX1JBTkdFX0NBTENVTEFUSU9OID0gdHJ1ZTtcbkZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfQ09PTElOR19GQUNUT1JfSU5DUkVNRU5UQUwgPSAwLjM7XG5GRExheW91dENvbnN0YW50cy5DT09MSU5HX0FEQVBUQVRJT05fRkFDVE9SID0gMC4zMztcbkZETGF5b3V0Q29uc3RhbnRzLkFEQVBUQVRJT05fTE9XRVJfTk9ERV9MSU1JVCA9IDEwMDA7XG5GRExheW91dENvbnN0YW50cy5BREFQVEFUSU9OX1VQUEVSX05PREVfTElNSVQgPSA1MDAwO1xuRkRMYXlvdXRDb25zdGFudHMuTUFYX05PREVfRElTUExBQ0VNRU5UX0lOQ1JFTUVOVEFMID0gMTAwLjA7XG5GRExheW91dENvbnN0YW50cy5NQVhfTk9ERV9ESVNQTEFDRU1FTlQgPSBGRExheW91dENvbnN0YW50cy5NQVhfTk9ERV9ESVNQTEFDRU1FTlRfSU5DUkVNRU5UQUwgKiAzO1xuRkRMYXlvdXRDb25zdGFudHMuTUlOX1JFUFVMU0lPTl9ESVNUID0gRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9FREdFX0xFTkdUSCAvIDEwLjA7XG5GRExheW91dENvbnN0YW50cy5DT05WRVJHRU5DRV9DSEVDS19QRVJJT0QgPSAxMDA7XG5GRExheW91dENvbnN0YW50cy5QRVJfTEVWRUxfSURFQUxfRURHRV9MRU5HVEhfRkFDVE9SID0gMC4xO1xuRkRMYXlvdXRDb25zdGFudHMuTUlOX0VER0VfTEVOR1RIID0gMTtcbkZETGF5b3V0Q29uc3RhbnRzLkdSSURfQ0FMQ1VMQVRJT05fQ0hFQ0tfUEVSSU9EID0gMTA7XG5cbm1vZHVsZS5leHBvcnRzID0gRkRMYXlvdXRDb25zdGFudHM7XG5cbi8qKiovIH0pLFxuLyogOCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcblxuXG4vKipcbiAqIFRoaXMgY2xhc3MgbWFpbnRhaW5zIGEgbGlzdCBvZiBzdGF0aWMgZ2VvbWV0cnkgcmVsYXRlZCB1dGlsaXR5IG1ldGhvZHMuXG4gKlxuICpcbiAqIENvcHlyaWdodDogaS1WaXMgUmVzZWFyY2ggR3JvdXAsIEJpbGtlbnQgVW5pdmVyc2l0eSwgMjAwNyAtIHByZXNlbnRcbiAqL1xuXG52YXIgUG9pbnQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEyKTtcblxuZnVuY3Rpb24gSUdlb21ldHJ5KCkge31cblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBjYWxjdWxhdGVzICpoYWxmKiB0aGUgYW1vdW50IGluIHggYW5kIHkgZGlyZWN0aW9ucyBvZiB0aGUgdHdvXG4gKiBpbnB1dCByZWN0YW5nbGVzIG5lZWRlZCB0byBzZXBhcmF0ZSB0aGVtIGtlZXBpbmcgdGhlaXIgcmVzcGVjdGl2ZVxuICogcG9zaXRpb25pbmcsIGFuZCByZXR1cm5zIHRoZSByZXN1bHQgaW4gdGhlIGlucHV0IGFycmF5LiBBbiBpbnB1dFxuICogc2VwYXJhdGlvbiBidWZmZXIgYWRkZWQgdG8gdGhlIGFtb3VudCBpbiBib3RoIGRpcmVjdGlvbnMuIFdlIGFzc3VtZSB0aGF0XG4gKiB0aGUgdHdvIHJlY3RhbmdsZXMgZG8gaW50ZXJzZWN0LlxuICovXG5JR2VvbWV0cnkuY2FsY1NlcGFyYXRpb25BbW91bnQgPSBmdW5jdGlvbiAocmVjdEEsIHJlY3RCLCBvdmVybGFwQW1vdW50LCBzZXBhcmF0aW9uQnVmZmVyKSB7XG4gIGlmICghcmVjdEEuaW50ZXJzZWN0cyhyZWN0QikpIHtcbiAgICB0aHJvdyBcImFzc2VydCBmYWlsZWRcIjtcbiAgfVxuXG4gIHZhciBkaXJlY3Rpb25zID0gbmV3IEFycmF5KDIpO1xuXG4gIHRoaXMuZGVjaWRlRGlyZWN0aW9uc0Zvck92ZXJsYXBwaW5nTm9kZXMocmVjdEEsIHJlY3RCLCBkaXJlY3Rpb25zKTtcblxuICBvdmVybGFwQW1vdW50WzBdID0gTWF0aC5taW4ocmVjdEEuZ2V0UmlnaHQoKSwgcmVjdEIuZ2V0UmlnaHQoKSkgLSBNYXRoLm1heChyZWN0QS54LCByZWN0Qi54KTtcbiAgb3ZlcmxhcEFtb3VudFsxXSA9IE1hdGgubWluKHJlY3RBLmdldEJvdHRvbSgpLCByZWN0Qi5nZXRCb3R0b20oKSkgLSBNYXRoLm1heChyZWN0QS55LCByZWN0Qi55KTtcblxuICAvLyB1cGRhdGUgdGhlIG92ZXJsYXBwaW5nIGFtb3VudHMgZm9yIHRoZSBmb2xsb3dpbmcgY2FzZXM6XG4gIGlmIChyZWN0QS5nZXRYKCkgPD0gcmVjdEIuZ2V0WCgpICYmIHJlY3RBLmdldFJpZ2h0KCkgPj0gcmVjdEIuZ2V0UmlnaHQoKSkge1xuICAgIC8qIENhc2UgeC4xOlxuICAgICpcbiAgICAqIHJlY3RBXG4gICAgKiBcdHwgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAqIFx0fCAgICAgICAgX19fX19fX19fICAgICAgfFxuICAgICogXHR8ICAgICAgICB8ICAgICAgIHwgICAgICB8XG4gICAgKiBcdHxfX19fX19fX3xfX19fX19ffF9fX19fX3xcbiAgICAqIFx0XHRcdCB8ICAgICAgIHxcbiAgICAqICAgICAgICAgICB8ICAgICAgIHxcbiAgICAqICAgICAgICByZWN0QlxuICAgICovXG4gICAgb3ZlcmxhcEFtb3VudFswXSArPSBNYXRoLm1pbihyZWN0Qi5nZXRYKCkgLSByZWN0QS5nZXRYKCksIHJlY3RBLmdldFJpZ2h0KCkgLSByZWN0Qi5nZXRSaWdodCgpKTtcbiAgfSBlbHNlIGlmIChyZWN0Qi5nZXRYKCkgPD0gcmVjdEEuZ2V0WCgpICYmIHJlY3RCLmdldFJpZ2h0KCkgPj0gcmVjdEEuZ2V0UmlnaHQoKSkge1xuICAgIC8qIENhc2UgeC4yOlxuICAgICpcbiAgICAqIHJlY3RCXG4gICAgKiBcdHwgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAqIFx0fCAgICAgICAgX19fX19fX19fICAgICAgfFxuICAgICogXHR8ICAgICAgICB8ICAgICAgIHwgICAgICB8XG4gICAgKiBcdHxfX19fX19fX3xfX19fX19ffF9fX19fX3xcbiAgICAqIFx0XHRcdCB8ICAgICAgIHxcbiAgICAqICAgICAgICAgICB8ICAgICAgIHxcbiAgICAqICAgICAgICByZWN0QVxuICAgICovXG4gICAgb3ZlcmxhcEFtb3VudFswXSArPSBNYXRoLm1pbihyZWN0QS5nZXRYKCkgLSByZWN0Qi5nZXRYKCksIHJlY3RCLmdldFJpZ2h0KCkgLSByZWN0QS5nZXRSaWdodCgpKTtcbiAgfVxuICBpZiAocmVjdEEuZ2V0WSgpIDw9IHJlY3RCLmdldFkoKSAmJiByZWN0QS5nZXRCb3R0b20oKSA+PSByZWN0Qi5nZXRCb3R0b20oKSkge1xuICAgIC8qIENhc2UgeS4xOlxuICAgICAqICAgICAgICAgIF9fX19fX19fIHJlY3RBXG4gICAgICogICAgICAgICB8XG4gICAgICogICAgICAgICB8XG4gICAgICogICBfX19fX198X19fXyAgcmVjdEJcbiAgICAgKiAgICAgICAgIHwgICAgfFxuICAgICAqICAgICAgICAgfCAgICB8XG4gICAgICogICBfX19fX198X19fX3xcbiAgICAgKiAgICAgICAgIHxcbiAgICAgKiAgICAgICAgIHxcbiAgICAgKiAgICAgICAgIHxfX19fX19fX1xuICAgICAqXG4gICAgICovXG4gICAgb3ZlcmxhcEFtb3VudFsxXSArPSBNYXRoLm1pbihyZWN0Qi5nZXRZKCkgLSByZWN0QS5nZXRZKCksIHJlY3RBLmdldEJvdHRvbSgpIC0gcmVjdEIuZ2V0Qm90dG9tKCkpO1xuICB9IGVsc2UgaWYgKHJlY3RCLmdldFkoKSA8PSByZWN0QS5nZXRZKCkgJiYgcmVjdEIuZ2V0Qm90dG9tKCkgPj0gcmVjdEEuZ2V0Qm90dG9tKCkpIHtcbiAgICAvKiBDYXNlIHkuMjpcbiAgICAqICAgICAgICAgIF9fX19fX19fIHJlY3RCXG4gICAgKiAgICAgICAgIHxcbiAgICAqICAgICAgICAgfFxuICAgICogICBfX19fX198X19fXyAgcmVjdEFcbiAgICAqICAgICAgICAgfCAgICB8XG4gICAgKiAgICAgICAgIHwgICAgfFxuICAgICogICBfX19fX198X19fX3xcbiAgICAqICAgICAgICAgfFxuICAgICogICAgICAgICB8XG4gICAgKiAgICAgICAgIHxfX19fX19fX1xuICAgICpcbiAgICAqL1xuICAgIG92ZXJsYXBBbW91bnRbMV0gKz0gTWF0aC5taW4ocmVjdEEuZ2V0WSgpIC0gcmVjdEIuZ2V0WSgpLCByZWN0Qi5nZXRCb3R0b20oKSAtIHJlY3RBLmdldEJvdHRvbSgpKTtcbiAgfVxuXG4gIC8vIGZpbmQgc2xvcGUgb2YgdGhlIGxpbmUgcGFzc2VzIHR3byBjZW50ZXJzXG4gIHZhciBzbG9wZSA9IE1hdGguYWJzKChyZWN0Qi5nZXRDZW50ZXJZKCkgLSByZWN0QS5nZXRDZW50ZXJZKCkpIC8gKHJlY3RCLmdldENlbnRlclgoKSAtIHJlY3RBLmdldENlbnRlclgoKSkpO1xuICAvLyBpZiBjZW50ZXJzIGFyZSBvdmVybGFwcGVkXG4gIGlmIChyZWN0Qi5nZXRDZW50ZXJZKCkgPT09IHJlY3RBLmdldENlbnRlclkoKSAmJiByZWN0Qi5nZXRDZW50ZXJYKCkgPT09IHJlY3RBLmdldENlbnRlclgoKSkge1xuICAgIC8vIGFzc3VtZSB0aGUgc2xvcGUgaXMgMSAoNDUgZGVncmVlKVxuICAgIHNsb3BlID0gMS4wO1xuICB9XG5cbiAgdmFyIG1vdmVCeVkgPSBzbG9wZSAqIG92ZXJsYXBBbW91bnRbMF07XG4gIHZhciBtb3ZlQnlYID0gb3ZlcmxhcEFtb3VudFsxXSAvIHNsb3BlO1xuICBpZiAob3ZlcmxhcEFtb3VudFswXSA8IG1vdmVCeVgpIHtcbiAgICBtb3ZlQnlYID0gb3ZlcmxhcEFtb3VudFswXTtcbiAgfSBlbHNlIHtcbiAgICBtb3ZlQnlZID0gb3ZlcmxhcEFtb3VudFsxXTtcbiAgfVxuICAvLyByZXR1cm4gaGFsZiB0aGUgYW1vdW50IHNvIHRoYXQgaWYgZWFjaCByZWN0YW5nbGUgaXMgbW92ZWQgYnkgdGhlc2VcbiAgLy8gYW1vdW50cyBpbiBvcHBvc2l0ZSBkaXJlY3Rpb25zLCBvdmVybGFwIHdpbGwgYmUgcmVzb2x2ZWRcbiAgb3ZlcmxhcEFtb3VudFswXSA9IC0xICogZGlyZWN0aW9uc1swXSAqIChtb3ZlQnlYIC8gMiArIHNlcGFyYXRpb25CdWZmZXIpO1xuICBvdmVybGFwQW1vdW50WzFdID0gLTEgKiBkaXJlY3Rpb25zWzFdICogKG1vdmVCeVkgLyAyICsgc2VwYXJhdGlvbkJ1ZmZlcik7XG59O1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGRlY2lkZXMgdGhlIHNlcGFyYXRpb24gZGlyZWN0aW9uIG9mIG92ZXJsYXBwaW5nIG5vZGVzXG4gKlxuICogaWYgZGlyZWN0aW9uc1swXSA9IC0xLCB0aGVuIHJlY3RBIGdvZXMgbGVmdFxuICogaWYgZGlyZWN0aW9uc1swXSA9IDEsICB0aGVuIHJlY3RBIGdvZXMgcmlnaHRcbiAqIGlmIGRpcmVjdGlvbnNbMV0gPSAtMSwgdGhlbiByZWN0QSBnb2VzIHVwXG4gKiBpZiBkaXJlY3Rpb25zWzFdID0gMSwgIHRoZW4gcmVjdEEgZ29lcyBkb3duXG4gKi9cbklHZW9tZXRyeS5kZWNpZGVEaXJlY3Rpb25zRm9yT3ZlcmxhcHBpbmdOb2RlcyA9IGZ1bmN0aW9uIChyZWN0QSwgcmVjdEIsIGRpcmVjdGlvbnMpIHtcbiAgaWYgKHJlY3RBLmdldENlbnRlclgoKSA8IHJlY3RCLmdldENlbnRlclgoKSkge1xuICAgIGRpcmVjdGlvbnNbMF0gPSAtMTtcbiAgfSBlbHNlIHtcbiAgICBkaXJlY3Rpb25zWzBdID0gMTtcbiAgfVxuXG4gIGlmIChyZWN0QS5nZXRDZW50ZXJZKCkgPCByZWN0Qi5nZXRDZW50ZXJZKCkpIHtcbiAgICBkaXJlY3Rpb25zWzFdID0gLTE7XG4gIH0gZWxzZSB7XG4gICAgZGlyZWN0aW9uc1sxXSA9IDE7XG4gIH1cbn07XG5cbi8qKlxuICogVGhpcyBtZXRob2QgY2FsY3VsYXRlcyB0aGUgaW50ZXJzZWN0aW9uIChjbGlwcGluZykgcG9pbnRzIG9mIHRoZSB0d29cbiAqIGlucHV0IHJlY3RhbmdsZXMgd2l0aCBsaW5lIHNlZ21lbnQgZGVmaW5lZCBieSB0aGUgY2VudGVycyBvZiB0aGVzZSB0d29cbiAqIHJlY3RhbmdsZXMuIFRoZSBjbGlwcGluZyBwb2ludHMgYXJlIHNhdmVkIGluIHRoZSBpbnB1dCBkb3VibGUgYXJyYXkgYW5kXG4gKiB3aGV0aGVyIG9yIG5vdCB0aGUgdHdvIHJlY3RhbmdsZXMgb3ZlcmxhcCBpcyByZXR1cm5lZC5cbiAqL1xuSUdlb21ldHJ5LmdldEludGVyc2VjdGlvbjIgPSBmdW5jdGlvbiAocmVjdEEsIHJlY3RCLCByZXN1bHQpIHtcbiAgLy9yZXN1bHRbMC0xXSB3aWxsIGNvbnRhaW4gY2xpcFBvaW50IG9mIHJlY3RBLCByZXN1bHRbMi0zXSB3aWxsIGNvbnRhaW4gY2xpcFBvaW50IG9mIHJlY3RCXG4gIHZhciBwMXggPSByZWN0QS5nZXRDZW50ZXJYKCk7XG4gIHZhciBwMXkgPSByZWN0QS5nZXRDZW50ZXJZKCk7XG4gIHZhciBwMnggPSByZWN0Qi5nZXRDZW50ZXJYKCk7XG4gIHZhciBwMnkgPSByZWN0Qi5nZXRDZW50ZXJZKCk7XG5cbiAgLy9pZiB0d28gcmVjdGFuZ2xlcyBpbnRlcnNlY3QsIHRoZW4gY2xpcHBpbmcgcG9pbnRzIGFyZSBjZW50ZXJzXG4gIGlmIChyZWN0QS5pbnRlcnNlY3RzKHJlY3RCKSkge1xuICAgIHJlc3VsdFswXSA9IHAxeDtcbiAgICByZXN1bHRbMV0gPSBwMXk7XG4gICAgcmVzdWx0WzJdID0gcDJ4O1xuICAgIHJlc3VsdFszXSA9IHAyeTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICAvL3ZhcmlhYmxlcyBmb3IgcmVjdEFcbiAgdmFyIHRvcExlZnRBeCA9IHJlY3RBLmdldFgoKTtcbiAgdmFyIHRvcExlZnRBeSA9IHJlY3RBLmdldFkoKTtcbiAgdmFyIHRvcFJpZ2h0QXggPSByZWN0QS5nZXRSaWdodCgpO1xuICB2YXIgYm90dG9tTGVmdEF4ID0gcmVjdEEuZ2V0WCgpO1xuICB2YXIgYm90dG9tTGVmdEF5ID0gcmVjdEEuZ2V0Qm90dG9tKCk7XG4gIHZhciBib3R0b21SaWdodEF4ID0gcmVjdEEuZ2V0UmlnaHQoKTtcbiAgdmFyIGhhbGZXaWR0aEEgPSByZWN0QS5nZXRXaWR0aEhhbGYoKTtcbiAgdmFyIGhhbGZIZWlnaHRBID0gcmVjdEEuZ2V0SGVpZ2h0SGFsZigpO1xuICAvL3ZhcmlhYmxlcyBmb3IgcmVjdEJcbiAgdmFyIHRvcExlZnRCeCA9IHJlY3RCLmdldFgoKTtcbiAgdmFyIHRvcExlZnRCeSA9IHJlY3RCLmdldFkoKTtcbiAgdmFyIHRvcFJpZ2h0QnggPSByZWN0Qi5nZXRSaWdodCgpO1xuICB2YXIgYm90dG9tTGVmdEJ4ID0gcmVjdEIuZ2V0WCgpO1xuICB2YXIgYm90dG9tTGVmdEJ5ID0gcmVjdEIuZ2V0Qm90dG9tKCk7XG4gIHZhciBib3R0b21SaWdodEJ4ID0gcmVjdEIuZ2V0UmlnaHQoKTtcbiAgdmFyIGhhbGZXaWR0aEIgPSByZWN0Qi5nZXRXaWR0aEhhbGYoKTtcbiAgdmFyIGhhbGZIZWlnaHRCID0gcmVjdEIuZ2V0SGVpZ2h0SGFsZigpO1xuXG4gIC8vZmxhZyB3aGV0aGVyIGNsaXBwaW5nIHBvaW50cyBhcmUgZm91bmRcbiAgdmFyIGNsaXBQb2ludEFGb3VuZCA9IGZhbHNlO1xuICB2YXIgY2xpcFBvaW50QkZvdW5kID0gZmFsc2U7XG5cbiAgLy8gbGluZSBpcyB2ZXJ0aWNhbFxuICBpZiAocDF4ID09PSBwMngpIHtcbiAgICBpZiAocDF5ID4gcDJ5KSB7XG4gICAgICByZXN1bHRbMF0gPSBwMXg7XG4gICAgICByZXN1bHRbMV0gPSB0b3BMZWZ0QXk7XG4gICAgICByZXN1bHRbMl0gPSBwMng7XG4gICAgICByZXN1bHRbM10gPSBib3R0b21MZWZ0Qnk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChwMXkgPCBwMnkpIHtcbiAgICAgIHJlc3VsdFswXSA9IHAxeDtcbiAgICAgIHJlc3VsdFsxXSA9IGJvdHRvbUxlZnRBeTtcbiAgICAgIHJlc3VsdFsyXSA9IHAyeDtcbiAgICAgIHJlc3VsdFszXSA9IHRvcExlZnRCeTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy9ub3QgbGluZSwgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG4gIC8vIGxpbmUgaXMgaG9yaXpvbnRhbFxuICBlbHNlIGlmIChwMXkgPT09IHAyeSkge1xuICAgICAgaWYgKHAxeCA+IHAyeCkge1xuICAgICAgICByZXN1bHRbMF0gPSB0b3BMZWZ0QXg7XG4gICAgICAgIHJlc3VsdFsxXSA9IHAxeTtcbiAgICAgICAgcmVzdWx0WzJdID0gdG9wUmlnaHRCeDtcbiAgICAgICAgcmVzdWx0WzNdID0gcDJ5O1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IGVsc2UgaWYgKHAxeCA8IHAyeCkge1xuICAgICAgICByZXN1bHRbMF0gPSB0b3BSaWdodEF4O1xuICAgICAgICByZXN1bHRbMV0gPSBwMXk7XG4gICAgICAgIHJlc3VsdFsyXSA9IHRvcExlZnRCeDtcbiAgICAgICAgcmVzdWx0WzNdID0gcDJ5O1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL25vdCB2YWxpZCBsaW5lLCByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy9zbG9wZXMgb2YgcmVjdEEncyBhbmQgcmVjdEIncyBkaWFnb25hbHNcbiAgICAgIHZhciBzbG9wZUEgPSByZWN0QS5oZWlnaHQgLyByZWN0QS53aWR0aDtcbiAgICAgIHZhciBzbG9wZUIgPSByZWN0Qi5oZWlnaHQgLyByZWN0Qi53aWR0aDtcblxuICAgICAgLy9zbG9wZSBvZiBsaW5lIGJldHdlZW4gY2VudGVyIG9mIHJlY3RBIGFuZCBjZW50ZXIgb2YgcmVjdEJcbiAgICAgIHZhciBzbG9wZVByaW1lID0gKHAyeSAtIHAxeSkgLyAocDJ4IC0gcDF4KTtcbiAgICAgIHZhciBjYXJkaW5hbERpcmVjdGlvbkEgPSB2b2lkIDA7XG4gICAgICB2YXIgY2FyZGluYWxEaXJlY3Rpb25CID0gdm9pZCAwO1xuICAgICAgdmFyIHRlbXBQb2ludEF4ID0gdm9pZCAwO1xuICAgICAgdmFyIHRlbXBQb2ludEF5ID0gdm9pZCAwO1xuICAgICAgdmFyIHRlbXBQb2ludEJ4ID0gdm9pZCAwO1xuICAgICAgdmFyIHRlbXBQb2ludEJ5ID0gdm9pZCAwO1xuXG4gICAgICAvL2RldGVybWluZSB3aGV0aGVyIGNsaXBwaW5nIHBvaW50IGlzIHRoZSBjb3JuZXIgb2Ygbm9kZUFcbiAgICAgIGlmICgtc2xvcGVBID09PSBzbG9wZVByaW1lKSB7XG4gICAgICAgIGlmIChwMXggPiBwMngpIHtcbiAgICAgICAgICByZXN1bHRbMF0gPSBib3R0b21MZWZ0QXg7XG4gICAgICAgICAgcmVzdWx0WzFdID0gYm90dG9tTGVmdEF5O1xuICAgICAgICAgIGNsaXBQb2ludEFGb3VuZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0WzBdID0gdG9wUmlnaHRBeDtcbiAgICAgICAgICByZXN1bHRbMV0gPSB0b3BMZWZ0QXk7XG4gICAgICAgICAgY2xpcFBvaW50QUZvdW5kID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChzbG9wZUEgPT09IHNsb3BlUHJpbWUpIHtcbiAgICAgICAgaWYgKHAxeCA+IHAyeCkge1xuICAgICAgICAgIHJlc3VsdFswXSA9IHRvcExlZnRBeDtcbiAgICAgICAgICByZXN1bHRbMV0gPSB0b3BMZWZ0QXk7XG4gICAgICAgICAgY2xpcFBvaW50QUZvdW5kID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHRbMF0gPSBib3R0b21SaWdodEF4O1xuICAgICAgICAgIHJlc3VsdFsxXSA9IGJvdHRvbUxlZnRBeTtcbiAgICAgICAgICBjbGlwUG9pbnRBRm91bmQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vZGV0ZXJtaW5lIHdoZXRoZXIgY2xpcHBpbmcgcG9pbnQgaXMgdGhlIGNvcm5lciBvZiBub2RlQlxuICAgICAgaWYgKC1zbG9wZUIgPT09IHNsb3BlUHJpbWUpIHtcbiAgICAgICAgaWYgKHAyeCA+IHAxeCkge1xuICAgICAgICAgIHJlc3VsdFsyXSA9IGJvdHRvbUxlZnRCeDtcbiAgICAgICAgICByZXN1bHRbM10gPSBib3R0b21MZWZ0Qnk7XG4gICAgICAgICAgY2xpcFBvaW50QkZvdW5kID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHRbMl0gPSB0b3BSaWdodEJ4O1xuICAgICAgICAgIHJlc3VsdFszXSA9IHRvcExlZnRCeTtcbiAgICAgICAgICBjbGlwUG9pbnRCRm91bmQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHNsb3BlQiA9PT0gc2xvcGVQcmltZSkge1xuICAgICAgICBpZiAocDJ4ID4gcDF4KSB7XG4gICAgICAgICAgcmVzdWx0WzJdID0gdG9wTGVmdEJ4O1xuICAgICAgICAgIHJlc3VsdFszXSA9IHRvcExlZnRCeTtcbiAgICAgICAgICBjbGlwUG9pbnRCRm91bmQgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdFsyXSA9IGJvdHRvbVJpZ2h0Qng7XG4gICAgICAgICAgcmVzdWx0WzNdID0gYm90dG9tTGVmdEJ5O1xuICAgICAgICAgIGNsaXBQb2ludEJGb3VuZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy9pZiBib3RoIGNsaXBwaW5nIHBvaW50cyBhcmUgY29ybmVyc1xuICAgICAgaWYgKGNsaXBQb2ludEFGb3VuZCAmJiBjbGlwUG9pbnRCRm91bmQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvL2RldGVybWluZSBDYXJkaW5hbCBEaXJlY3Rpb24gb2YgcmVjdGFuZ2xlc1xuICAgICAgaWYgKHAxeCA+IHAyeCkge1xuICAgICAgICBpZiAocDF5ID4gcDJ5KSB7XG4gICAgICAgICAgY2FyZGluYWxEaXJlY3Rpb25BID0gdGhpcy5nZXRDYXJkaW5hbERpcmVjdGlvbihzbG9wZUEsIHNsb3BlUHJpbWUsIDQpO1xuICAgICAgICAgIGNhcmRpbmFsRGlyZWN0aW9uQiA9IHRoaXMuZ2V0Q2FyZGluYWxEaXJlY3Rpb24oc2xvcGVCLCBzbG9wZVByaW1lLCAyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjYXJkaW5hbERpcmVjdGlvbkEgPSB0aGlzLmdldENhcmRpbmFsRGlyZWN0aW9uKC1zbG9wZUEsIHNsb3BlUHJpbWUsIDMpO1xuICAgICAgICAgIGNhcmRpbmFsRGlyZWN0aW9uQiA9IHRoaXMuZ2V0Q2FyZGluYWxEaXJlY3Rpb24oLXNsb3BlQiwgc2xvcGVQcmltZSwgMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChwMXkgPiBwMnkpIHtcbiAgICAgICAgICBjYXJkaW5hbERpcmVjdGlvbkEgPSB0aGlzLmdldENhcmRpbmFsRGlyZWN0aW9uKC1zbG9wZUEsIHNsb3BlUHJpbWUsIDEpO1xuICAgICAgICAgIGNhcmRpbmFsRGlyZWN0aW9uQiA9IHRoaXMuZ2V0Q2FyZGluYWxEaXJlY3Rpb24oLXNsb3BlQiwgc2xvcGVQcmltZSwgMyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FyZGluYWxEaXJlY3Rpb25BID0gdGhpcy5nZXRDYXJkaW5hbERpcmVjdGlvbihzbG9wZUEsIHNsb3BlUHJpbWUsIDIpO1xuICAgICAgICAgIGNhcmRpbmFsRGlyZWN0aW9uQiA9IHRoaXMuZ2V0Q2FyZGluYWxEaXJlY3Rpb24oc2xvcGVCLCBzbG9wZVByaW1lLCA0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy9jYWxjdWxhdGUgY2xpcHBpbmcgUG9pbnQgaWYgaXQgaXMgbm90IGZvdW5kIGJlZm9yZVxuICAgICAgaWYgKCFjbGlwUG9pbnRBRm91bmQpIHtcbiAgICAgICAgc3dpdGNoIChjYXJkaW5hbERpcmVjdGlvbkEpIHtcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICB0ZW1wUG9pbnRBeSA9IHRvcExlZnRBeTtcbiAgICAgICAgICAgIHRlbXBQb2ludEF4ID0gcDF4ICsgLWhhbGZIZWlnaHRBIC8gc2xvcGVQcmltZTtcbiAgICAgICAgICAgIHJlc3VsdFswXSA9IHRlbXBQb2ludEF4O1xuICAgICAgICAgICAgcmVzdWx0WzFdID0gdGVtcFBvaW50QXk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICB0ZW1wUG9pbnRBeCA9IGJvdHRvbVJpZ2h0QXg7XG4gICAgICAgICAgICB0ZW1wUG9pbnRBeSA9IHAxeSArIGhhbGZXaWR0aEEgKiBzbG9wZVByaW1lO1xuICAgICAgICAgICAgcmVzdWx0WzBdID0gdGVtcFBvaW50QXg7XG4gICAgICAgICAgICByZXN1bHRbMV0gPSB0ZW1wUG9pbnRBeTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHRlbXBQb2ludEF5ID0gYm90dG9tTGVmdEF5O1xuICAgICAgICAgICAgdGVtcFBvaW50QXggPSBwMXggKyBoYWxmSGVpZ2h0QSAvIHNsb3BlUHJpbWU7XG4gICAgICAgICAgICByZXN1bHRbMF0gPSB0ZW1wUG9pbnRBeDtcbiAgICAgICAgICAgIHJlc3VsdFsxXSA9IHRlbXBQb2ludEF5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgdGVtcFBvaW50QXggPSBib3R0b21MZWZ0QXg7XG4gICAgICAgICAgICB0ZW1wUG9pbnRBeSA9IHAxeSArIC1oYWxmV2lkdGhBICogc2xvcGVQcmltZTtcbiAgICAgICAgICAgIHJlc3VsdFswXSA9IHRlbXBQb2ludEF4O1xuICAgICAgICAgICAgcmVzdWx0WzFdID0gdGVtcFBvaW50QXk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFjbGlwUG9pbnRCRm91bmQpIHtcbiAgICAgICAgc3dpdGNoIChjYXJkaW5hbERpcmVjdGlvbkIpIHtcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICB0ZW1wUG9pbnRCeSA9IHRvcExlZnRCeTtcbiAgICAgICAgICAgIHRlbXBQb2ludEJ4ID0gcDJ4ICsgLWhhbGZIZWlnaHRCIC8gc2xvcGVQcmltZTtcbiAgICAgICAgICAgIHJlc3VsdFsyXSA9IHRlbXBQb2ludEJ4O1xuICAgICAgICAgICAgcmVzdWx0WzNdID0gdGVtcFBvaW50Qnk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICB0ZW1wUG9pbnRCeCA9IGJvdHRvbVJpZ2h0Qng7XG4gICAgICAgICAgICB0ZW1wUG9pbnRCeSA9IHAyeSArIGhhbGZXaWR0aEIgKiBzbG9wZVByaW1lO1xuICAgICAgICAgICAgcmVzdWx0WzJdID0gdGVtcFBvaW50Qng7XG4gICAgICAgICAgICByZXN1bHRbM10gPSB0ZW1wUG9pbnRCeTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHRlbXBQb2ludEJ5ID0gYm90dG9tTGVmdEJ5O1xuICAgICAgICAgICAgdGVtcFBvaW50QnggPSBwMnggKyBoYWxmSGVpZ2h0QiAvIHNsb3BlUHJpbWU7XG4gICAgICAgICAgICByZXN1bHRbMl0gPSB0ZW1wUG9pbnRCeDtcbiAgICAgICAgICAgIHJlc3VsdFszXSA9IHRlbXBQb2ludEJ5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgdGVtcFBvaW50QnggPSBib3R0b21MZWZ0Qng7XG4gICAgICAgICAgICB0ZW1wUG9pbnRCeSA9IHAyeSArIC1oYWxmV2lkdGhCICogc2xvcGVQcmltZTtcbiAgICAgICAgICAgIHJlc3VsdFsyXSA9IHRlbXBQb2ludEJ4O1xuICAgICAgICAgICAgcmVzdWx0WzNdID0gdGVtcFBvaW50Qnk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIGluIHdoaWNoIGNhcmRpbmFsIGRpcmVjdGlvbiBkb2VzIGlucHV0IHBvaW50IHN0YXlzXG4gKiAxOiBOb3J0aFxuICogMjogRWFzdFxuICogMzogU291dGhcbiAqIDQ6IFdlc3RcbiAqL1xuSUdlb21ldHJ5LmdldENhcmRpbmFsRGlyZWN0aW9uID0gZnVuY3Rpb24gKHNsb3BlLCBzbG9wZVByaW1lLCBsaW5lKSB7XG4gIGlmIChzbG9wZSA+IHNsb3BlUHJpbWUpIHtcbiAgICByZXR1cm4gbGluZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gMSArIGxpbmUgJSA0O1xuICB9XG59O1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGNhbGN1bGF0ZXMgdGhlIGludGVyc2VjdGlvbiBvZiB0aGUgdHdvIGxpbmVzIGRlZmluZWQgYnlcbiAqIHBvaW50IHBhaXJzIChzMSxzMikgYW5kIChmMSxmMikuXG4gKi9cbklHZW9tZXRyeS5nZXRJbnRlcnNlY3Rpb24gPSBmdW5jdGlvbiAoczEsIHMyLCBmMSwgZjIpIHtcbiAgaWYgKGYyID09IG51bGwpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRJbnRlcnNlY3Rpb24yKHMxLCBzMiwgZjEpO1xuICB9XG5cbiAgdmFyIHgxID0gczEueDtcbiAgdmFyIHkxID0gczEueTtcbiAgdmFyIHgyID0gczIueDtcbiAgdmFyIHkyID0gczIueTtcbiAgdmFyIHgzID0gZjEueDtcbiAgdmFyIHkzID0gZjEueTtcbiAgdmFyIHg0ID0gZjIueDtcbiAgdmFyIHk0ID0gZjIueTtcbiAgdmFyIHggPSB2b2lkIDAsXG4gICAgICB5ID0gdm9pZCAwOyAvLyBpbnRlcnNlY3Rpb24gcG9pbnRcbiAgdmFyIGExID0gdm9pZCAwLFxuICAgICAgYTIgPSB2b2lkIDAsXG4gICAgICBiMSA9IHZvaWQgMCxcbiAgICAgIGIyID0gdm9pZCAwLFxuICAgICAgYzEgPSB2b2lkIDAsXG4gICAgICBjMiA9IHZvaWQgMDsgLy8gY29lZmZpY2llbnRzIG9mIGxpbmUgZXFucy5cbiAgdmFyIGRlbm9tID0gdm9pZCAwO1xuXG4gIGExID0geTIgLSB5MTtcbiAgYjEgPSB4MSAtIHgyO1xuICBjMSA9IHgyICogeTEgLSB4MSAqIHkyOyAvLyB7IGExKnggKyBiMSp5ICsgYzEgPSAwIGlzIGxpbmUgMSB9XG5cbiAgYTIgPSB5NCAtIHkzO1xuICBiMiA9IHgzIC0geDQ7XG4gIGMyID0geDQgKiB5MyAtIHgzICogeTQ7IC8vIHsgYTIqeCArIGIyKnkgKyBjMiA9IDAgaXMgbGluZSAyIH1cblxuICBkZW5vbSA9IGExICogYjIgLSBhMiAqIGIxO1xuXG4gIGlmIChkZW5vbSA9PT0gMCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgeCA9IChiMSAqIGMyIC0gYjIgKiBjMSkgLyBkZW5vbTtcbiAgeSA9IChhMiAqIGMxIC0gYTEgKiBjMikgLyBkZW5vbTtcblxuICByZXR1cm4gbmV3IFBvaW50KHgsIHkpO1xufTtcblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBmaW5kcyBhbmQgcmV0dXJucyB0aGUgYW5nbGUgb2YgdGhlIHZlY3RvciBmcm9tIHRoZSArIHgtYXhpc1xuICogaW4gY2xvY2t3aXNlIGRpcmVjdGlvbiAoY29tcGF0aWJsZSB3LyBKYXZhIGNvb3JkaW5hdGUgc3lzdGVtISkuXG4gKi9cbklHZW9tZXRyeS5hbmdsZU9mVmVjdG9yID0gZnVuY3Rpb24gKEN4LCBDeSwgTngsIE55KSB7XG4gIHZhciBDX2FuZ2xlID0gdm9pZCAwO1xuXG4gIGlmIChDeCAhPT0gTngpIHtcbiAgICBDX2FuZ2xlID0gTWF0aC5hdGFuKChOeSAtIEN5KSAvIChOeCAtIEN4KSk7XG5cbiAgICBpZiAoTnggPCBDeCkge1xuICAgICAgQ19hbmdsZSArPSBNYXRoLlBJO1xuICAgIH0gZWxzZSBpZiAoTnkgPCBDeSkge1xuICAgICAgQ19hbmdsZSArPSB0aGlzLlRXT19QSTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoTnkgPCBDeSkge1xuICAgIENfYW5nbGUgPSB0aGlzLk9ORV9BTkRfSEFMRl9QSTsgLy8gMjcwIGRlZ3JlZXNcbiAgfSBlbHNlIHtcbiAgICBDX2FuZ2xlID0gdGhpcy5IQUxGX1BJOyAvLyA5MCBkZWdyZWVzXG4gIH1cblxuICByZXR1cm4gQ19hbmdsZTtcbn07XG5cbi8qKlxuICogVGhpcyBtZXRob2QgY2hlY2tzIHdoZXRoZXIgdGhlIGdpdmVuIHR3byBsaW5lIHNlZ21lbnRzIChvbmUgd2l0aCBwb2ludFxuICogcDEgYW5kIHAyLCB0aGUgb3RoZXIgd2l0aCBwb2ludCBwMyBhbmQgcDQpIGludGVyc2VjdCBhdCBhIHBvaW50IG90aGVyXG4gKiB0aGFuIHRoZXNlIHBvaW50cy5cbiAqL1xuSUdlb21ldHJ5LmRvSW50ZXJzZWN0ID0gZnVuY3Rpb24gKHAxLCBwMiwgcDMsIHA0KSB7XG4gIHZhciBhID0gcDEueDtcbiAgdmFyIGIgPSBwMS55O1xuICB2YXIgYyA9IHAyLng7XG4gIHZhciBkID0gcDIueTtcbiAgdmFyIHAgPSBwMy54O1xuICB2YXIgcSA9IHAzLnk7XG4gIHZhciByID0gcDQueDtcbiAgdmFyIHMgPSBwNC55O1xuICB2YXIgZGV0ID0gKGMgLSBhKSAqIChzIC0gcSkgLSAociAtIHApICogKGQgLSBiKTtcblxuICBpZiAoZGV0ID09PSAwKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9IGVsc2Uge1xuICAgIHZhciBsYW1iZGEgPSAoKHMgLSBxKSAqIChyIC0gYSkgKyAocCAtIHIpICogKHMgLSBiKSkgLyBkZXQ7XG4gICAgdmFyIGdhbW1hID0gKChiIC0gZCkgKiAociAtIGEpICsgKGMgLSBhKSAqIChzIC0gYikpIC8gZGV0O1xuICAgIHJldHVybiAwIDwgbGFtYmRhICYmIGxhbWJkYSA8IDEgJiYgMCA8IGdhbW1hICYmIGdhbW1hIDwgMTtcbiAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFNlY3Rpb246IENsYXNzIENvbnN0YW50c1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8qKlxuICogU29tZSB1c2VmdWwgcHJlLWNhbGN1bGF0ZWQgY29uc3RhbnRzXG4gKi9cbklHZW9tZXRyeS5IQUxGX1BJID0gMC41ICogTWF0aC5QSTtcbklHZW9tZXRyeS5PTkVfQU5EX0hBTEZfUEkgPSAxLjUgKiBNYXRoLlBJO1xuSUdlb21ldHJ5LlRXT19QSSA9IDIuMCAqIE1hdGguUEk7XG5JR2VvbWV0cnkuVEhSRUVfUEkgPSAzLjAgKiBNYXRoLlBJO1xuXG5tb2R1bGUuZXhwb3J0cyA9IElHZW9tZXRyeTtcblxuLyoqKi8gfSksXG4vKiA5ICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG5cbmZ1bmN0aW9uIElNYXRoKCkge31cblxuLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIHRoZSBzaWduIG9mIHRoZSBpbnB1dCB2YWx1ZS5cbiAqL1xuSU1hdGguc2lnbiA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBpZiAodmFsdWUgPiAwKSB7XG4gICAgcmV0dXJuIDE7XG4gIH0gZWxzZSBpZiAodmFsdWUgPCAwKSB7XG4gICAgcmV0dXJuIC0xO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAwO1xuICB9XG59O1xuXG5JTWF0aC5mbG9vciA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPCAwID8gTWF0aC5jZWlsKHZhbHVlKSA6IE1hdGguZmxvb3IodmFsdWUpO1xufTtcblxuSU1hdGguY2VpbCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPCAwID8gTWF0aC5mbG9vcih2YWx1ZSkgOiBNYXRoLmNlaWwodmFsdWUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJTWF0aDtcblxuLyoqKi8gfSksXG4vKiAxMCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcblxuXG5mdW5jdGlvbiBJbnRlZ2VyKCkge31cblxuSW50ZWdlci5NQVhfVkFMVUUgPSAyMTQ3NDgzNjQ3O1xuSW50ZWdlci5NSU5fVkFMVUUgPSAtMjE0NzQ4MzY0ODtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlZ2VyO1xuXG4vKioqLyB9KSxcbi8qIDExICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBub2RlRnJvbSA9IGZ1bmN0aW9uIG5vZGVGcm9tKHZhbHVlKSB7XG4gIHJldHVybiB7IHZhbHVlOiB2YWx1ZSwgbmV4dDogbnVsbCwgcHJldjogbnVsbCB9O1xufTtcblxudmFyIGFkZCA9IGZ1bmN0aW9uIGFkZChwcmV2LCBub2RlLCBuZXh0LCBsaXN0KSB7XG4gIGlmIChwcmV2ICE9PSBudWxsKSB7XG4gICAgcHJldi5uZXh0ID0gbm9kZTtcbiAgfSBlbHNlIHtcbiAgICBsaXN0LmhlYWQgPSBub2RlO1xuICB9XG5cbiAgaWYgKG5leHQgIT09IG51bGwpIHtcbiAgICBuZXh0LnByZXYgPSBub2RlO1xuICB9IGVsc2Uge1xuICAgIGxpc3QudGFpbCA9IG5vZGU7XG4gIH1cblxuICBub2RlLnByZXYgPSBwcmV2O1xuICBub2RlLm5leHQgPSBuZXh0O1xuXG4gIGxpc3QubGVuZ3RoKys7XG5cbiAgcmV0dXJuIG5vZGU7XG59O1xuXG52YXIgX3JlbW92ZSA9IGZ1bmN0aW9uIF9yZW1vdmUobm9kZSwgbGlzdCkge1xuICB2YXIgcHJldiA9IG5vZGUucHJldixcbiAgICAgIG5leHQgPSBub2RlLm5leHQ7XG5cblxuICBpZiAocHJldiAhPT0gbnVsbCkge1xuICAgIHByZXYubmV4dCA9IG5leHQ7XG4gIH0gZWxzZSB7XG4gICAgbGlzdC5oZWFkID0gbmV4dDtcbiAgfVxuXG4gIGlmIChuZXh0ICE9PSBudWxsKSB7XG4gICAgbmV4dC5wcmV2ID0gcHJldjtcbiAgfSBlbHNlIHtcbiAgICBsaXN0LnRhaWwgPSBwcmV2O1xuICB9XG5cbiAgbm9kZS5wcmV2ID0gbm9kZS5uZXh0ID0gbnVsbDtcblxuICBsaXN0Lmxlbmd0aC0tO1xuXG4gIHJldHVybiBub2RlO1xufTtcblxudmFyIExpbmtlZExpc3QgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIExpbmtlZExpc3QodmFscykge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTGlua2VkTGlzdCk7XG5cbiAgICB0aGlzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5oZWFkID0gbnVsbDtcbiAgICB0aGlzLnRhaWwgPSBudWxsO1xuXG4gICAgaWYgKHZhbHMgIT0gbnVsbCkge1xuICAgICAgdmFscy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIHJldHVybiBfdGhpcy5wdXNoKHYpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKExpbmtlZExpc3QsIFt7XG4gICAga2V5OiBcInNpemVcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2l6ZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLmxlbmd0aDtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiaW5zZXJ0QmVmb3JlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGluc2VydEJlZm9yZSh2YWwsIG90aGVyTm9kZSkge1xuICAgICAgcmV0dXJuIGFkZChvdGhlck5vZGUucHJldiwgbm9kZUZyb20odmFsKSwgb3RoZXJOb2RlLCB0aGlzKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiaW5zZXJ0QWZ0ZXJcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gaW5zZXJ0QWZ0ZXIodmFsLCBvdGhlck5vZGUpIHtcbiAgICAgIHJldHVybiBhZGQob3RoZXJOb2RlLCBub2RlRnJvbSh2YWwpLCBvdGhlck5vZGUubmV4dCwgdGhpcyk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImluc2VydE5vZGVCZWZvcmVcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gaW5zZXJ0Tm9kZUJlZm9yZShuZXdOb2RlLCBvdGhlck5vZGUpIHtcbiAgICAgIHJldHVybiBhZGQob3RoZXJOb2RlLnByZXYsIG5ld05vZGUsIG90aGVyTm9kZSwgdGhpcyk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImluc2VydE5vZGVBZnRlclwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBpbnNlcnROb2RlQWZ0ZXIobmV3Tm9kZSwgb3RoZXJOb2RlKSB7XG4gICAgICByZXR1cm4gYWRkKG90aGVyTm9kZSwgbmV3Tm9kZSwgb3RoZXJOb2RlLm5leHQsIHRoaXMpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJwdXNoXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHB1c2godmFsKSB7XG4gICAgICByZXR1cm4gYWRkKHRoaXMudGFpbCwgbm9kZUZyb20odmFsKSwgbnVsbCwgdGhpcyk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInVuc2hpZnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gdW5zaGlmdCh2YWwpIHtcbiAgICAgIHJldHVybiBhZGQobnVsbCwgbm9kZUZyb20odmFsKSwgdGhpcy5oZWFkLCB0aGlzKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwicmVtb3ZlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZShub2RlKSB7XG4gICAgICByZXR1cm4gX3JlbW92ZShub2RlLCB0aGlzKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwicG9wXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHBvcCgpIHtcbiAgICAgIHJldHVybiBfcmVtb3ZlKHRoaXMudGFpbCwgdGhpcykudmFsdWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInBvcE5vZGVcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcG9wTm9kZSgpIHtcbiAgICAgIHJldHVybiBfcmVtb3ZlKHRoaXMudGFpbCwgdGhpcyk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInNoaWZ0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNoaWZ0KCkge1xuICAgICAgcmV0dXJuIF9yZW1vdmUodGhpcy5oZWFkLCB0aGlzKS52YWx1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwic2hpZnROb2RlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNoaWZ0Tm9kZSgpIHtcbiAgICAgIHJldHVybiBfcmVtb3ZlKHRoaXMuaGVhZCwgdGhpcyk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImdldF9vYmplY3RfYXRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0X29iamVjdF9hdChpbmRleCkge1xuICAgICAgaWYgKGluZGV4IDw9IHRoaXMubGVuZ3RoKCkpIHtcbiAgICAgICAgdmFyIGkgPSAxO1xuICAgICAgICB2YXIgY3VycmVudCA9IHRoaXMuaGVhZDtcbiAgICAgICAgd2hpbGUgKGkgPCBpbmRleCkge1xuICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHQ7XG4gICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjdXJyZW50LnZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJzZXRfb2JqZWN0X2F0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldF9vYmplY3RfYXQoaW5kZXgsIHZhbHVlKSB7XG4gICAgICBpZiAoaW5kZXggPD0gdGhpcy5sZW5ndGgoKSkge1xuICAgICAgICB2YXIgaSA9IDE7XG4gICAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5oZWFkO1xuICAgICAgICB3aGlsZSAoaSA8IGluZGV4KSB7XG4gICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dDtcbiAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgICAgY3VycmVudC52YWx1ZSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBMaW5rZWRMaXN0O1xufSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpbmtlZExpc3Q7XG5cbi8qKiovIH0pLFxuLyogMTIgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cblxuLypcclxuICpUaGlzIGNsYXNzIGlzIHRoZSBqYXZhc2NyaXB0IGltcGxlbWVudGF0aW9uIG9mIHRoZSBQb2ludC5qYXZhIGNsYXNzIGluIGpka1xyXG4gKi9cbmZ1bmN0aW9uIFBvaW50KHgsIHksIHApIHtcbiAgdGhpcy54ID0gbnVsbDtcbiAgdGhpcy55ID0gbnVsbDtcbiAgaWYgKHggPT0gbnVsbCAmJiB5ID09IG51bGwgJiYgcCA9PSBudWxsKSB7XG4gICAgdGhpcy54ID0gMDtcbiAgICB0aGlzLnkgPSAwO1xuICB9IGVsc2UgaWYgKHR5cGVvZiB4ID09ICdudW1iZXInICYmIHR5cGVvZiB5ID09ICdudW1iZXInICYmIHAgPT0gbnVsbCkge1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgfSBlbHNlIGlmICh4LmNvbnN0cnVjdG9yLm5hbWUgPT0gJ1BvaW50JyAmJiB5ID09IG51bGwgJiYgcCA9PSBudWxsKSB7XG4gICAgcCA9IHg7XG4gICAgdGhpcy54ID0gcC54O1xuICAgIHRoaXMueSA9IHAueTtcbiAgfVxufVxuXG5Qb2ludC5wcm90b3R5cGUuZ2V0WCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMueDtcbn07XG5cblBvaW50LnByb3RvdHlwZS5nZXRZID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy55O1xufTtcblxuUG9pbnQucHJvdG90eXBlLmdldExvY2F0aW9uID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gbmV3IFBvaW50KHRoaXMueCwgdGhpcy55KTtcbn07XG5cblBvaW50LnByb3RvdHlwZS5zZXRMb2NhdGlvbiA9IGZ1bmN0aW9uICh4LCB5LCBwKSB7XG4gIGlmICh4LmNvbnN0cnVjdG9yLm5hbWUgPT0gJ1BvaW50JyAmJiB5ID09IG51bGwgJiYgcCA9PSBudWxsKSB7XG4gICAgcCA9IHg7XG4gICAgdGhpcy5zZXRMb2NhdGlvbihwLngsIHAueSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHggPT0gJ251bWJlcicgJiYgdHlwZW9mIHkgPT0gJ251bWJlcicgJiYgcCA9PSBudWxsKSB7XG4gICAgLy9pZiBib3RoIHBhcmFtZXRlcnMgYXJlIGludGVnZXIganVzdCBtb3ZlICh4LHkpIGxvY2F0aW9uXG4gICAgaWYgKHBhcnNlSW50KHgpID09IHggJiYgcGFyc2VJbnQoeSkgPT0geSkge1xuICAgICAgdGhpcy5tb3ZlKHgsIHkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnggPSBNYXRoLmZsb29yKHggKyAwLjUpO1xuICAgICAgdGhpcy55ID0gTWF0aC5mbG9vcih5ICsgMC41KTtcbiAgICB9XG4gIH1cbn07XG5cblBvaW50LnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgdGhpcy54ID0geDtcbiAgdGhpcy55ID0geTtcbn07XG5cblBvaW50LnByb3RvdHlwZS50cmFuc2xhdGUgPSBmdW5jdGlvbiAoZHgsIGR5KSB7XG4gIHRoaXMueCArPSBkeDtcbiAgdGhpcy55ICs9IGR5O1xufTtcblxuUG9pbnQucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIChvYmopIHtcbiAgaWYgKG9iai5jb25zdHJ1Y3Rvci5uYW1lID09IFwiUG9pbnRcIikge1xuICAgIHZhciBwdCA9IG9iajtcbiAgICByZXR1cm4gdGhpcy54ID09IHB0LnggJiYgdGhpcy55ID09IHB0Lnk7XG4gIH1cbiAgcmV0dXJuIHRoaXMgPT0gb2JqO1xufTtcblxuUG9pbnQucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gbmV3IFBvaW50KCkuY29uc3RydWN0b3IubmFtZSArIFwiW3g9XCIgKyB0aGlzLnggKyBcIix5PVwiICsgdGhpcy55ICsgXCJdXCI7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvaW50O1xuXG4vKioqLyB9KSxcbi8qIDEzICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG5cbmZ1bmN0aW9uIFJlY3RhbmdsZUQoeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICB0aGlzLnggPSAwO1xuICB0aGlzLnkgPSAwO1xuICB0aGlzLndpZHRoID0gMDtcbiAgdGhpcy5oZWlnaHQgPSAwO1xuXG4gIGlmICh4ICE9IG51bGwgJiYgeSAhPSBudWxsICYmIHdpZHRoICE9IG51bGwgJiYgaGVpZ2h0ICE9IG51bGwpIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICB9XG59XG5cblJlY3RhbmdsZUQucHJvdG90eXBlLmdldFggPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLng7XG59O1xuXG5SZWN0YW5nbGVELnByb3RvdHlwZS5zZXRYID0gZnVuY3Rpb24gKHgpIHtcbiAgdGhpcy54ID0geDtcbn07XG5cblJlY3RhbmdsZUQucHJvdG90eXBlLmdldFkgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnk7XG59O1xuXG5SZWN0YW5nbGVELnByb3RvdHlwZS5zZXRZID0gZnVuY3Rpb24gKHkpIHtcbiAgdGhpcy55ID0geTtcbn07XG5cblJlY3RhbmdsZUQucHJvdG90eXBlLmdldFdpZHRoID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy53aWR0aDtcbn07XG5cblJlY3RhbmdsZUQucHJvdG90eXBlLnNldFdpZHRoID0gZnVuY3Rpb24gKHdpZHRoKSB7XG4gIHRoaXMud2lkdGggPSB3aWR0aDtcbn07XG5cblJlY3RhbmdsZUQucHJvdG90eXBlLmdldEhlaWdodCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuaGVpZ2h0O1xufTtcblxuUmVjdGFuZ2xlRC5wcm90b3R5cGUuc2V0SGVpZ2h0ID0gZnVuY3Rpb24gKGhlaWdodCkge1xuICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbn07XG5cblJlY3RhbmdsZUQucHJvdG90eXBlLmdldFJpZ2h0ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy54ICsgdGhpcy53aWR0aDtcbn07XG5cblJlY3RhbmdsZUQucHJvdG90eXBlLmdldEJvdHRvbSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMueSArIHRoaXMuaGVpZ2h0O1xufTtcblxuUmVjdGFuZ2xlRC5wcm90b3R5cGUuaW50ZXJzZWN0cyA9IGZ1bmN0aW9uIChhKSB7XG4gIGlmICh0aGlzLmdldFJpZ2h0KCkgPCBhLngpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodGhpcy5nZXRCb3R0b20oKSA8IGEueSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChhLmdldFJpZ2h0KCkgPCB0aGlzLngpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoYS5nZXRCb3R0b20oKSA8IHRoaXMueSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuUmVjdGFuZ2xlRC5wcm90b3R5cGUuZ2V0Q2VudGVyWCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMueCArIHRoaXMud2lkdGggLyAyO1xufTtcblxuUmVjdGFuZ2xlRC5wcm90b3R5cGUuZ2V0TWluWCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZ2V0WCgpO1xufTtcblxuUmVjdGFuZ2xlRC5wcm90b3R5cGUuZ2V0TWF4WCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZ2V0WCgpICsgdGhpcy53aWR0aDtcbn07XG5cblJlY3RhbmdsZUQucHJvdG90eXBlLmdldENlbnRlclkgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnkgKyB0aGlzLmhlaWdodCAvIDI7XG59O1xuXG5SZWN0YW5nbGVELnByb3RvdHlwZS5nZXRNaW5ZID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5nZXRZKCk7XG59O1xuXG5SZWN0YW5nbGVELnByb3RvdHlwZS5nZXRNYXhZID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5nZXRZKCkgKyB0aGlzLmhlaWdodDtcbn07XG5cblJlY3RhbmdsZUQucHJvdG90eXBlLmdldFdpZHRoSGFsZiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMud2lkdGggLyAyO1xufTtcblxuUmVjdGFuZ2xlRC5wcm90b3R5cGUuZ2V0SGVpZ2h0SGFsZiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuaGVpZ2h0IC8gMjtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUmVjdGFuZ2xlRDtcblxuLyoqKi8gfSksXG4vKiAxNCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcblxuXG52YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbmZ1bmN0aW9uIFVuaXF1ZUlER2VuZXJldG9yKCkge31cblxuVW5pcXVlSURHZW5lcmV0b3IubGFzdElEID0gMDtcblxuVW5pcXVlSURHZW5lcmV0b3IuY3JlYXRlSUQgPSBmdW5jdGlvbiAob2JqKSB7XG4gIGlmIChVbmlxdWVJREdlbmVyZXRvci5pc1ByaW1pdGl2ZShvYmopKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuICBpZiAob2JqLnVuaXF1ZUlEICE9IG51bGwpIHtcbiAgICByZXR1cm4gb2JqLnVuaXF1ZUlEO1xuICB9XG4gIG9iai51bmlxdWVJRCA9IFVuaXF1ZUlER2VuZXJldG9yLmdldFN0cmluZygpO1xuICBVbmlxdWVJREdlbmVyZXRvci5sYXN0SUQrKztcbiAgcmV0dXJuIG9iai51bmlxdWVJRDtcbn07XG5cblVuaXF1ZUlER2VuZXJldG9yLmdldFN0cmluZyA9IGZ1bmN0aW9uIChpZCkge1xuICBpZiAoaWQgPT0gbnVsbCkgaWQgPSBVbmlxdWVJREdlbmVyZXRvci5sYXN0SUQ7XG4gIHJldHVybiBcIk9iamVjdCNcIiArIGlkICsgXCJcIjtcbn07XG5cblVuaXF1ZUlER2VuZXJldG9yLmlzUHJpbWl0aXZlID0gZnVuY3Rpb24gKGFyZykge1xuICB2YXIgdHlwZSA9IHR5cGVvZiBhcmcgPT09IFwidW5kZWZpbmVkXCIgPyBcInVuZGVmaW5lZFwiIDogX3R5cGVvZihhcmcpO1xuICByZXR1cm4gYXJnID09IG51bGwgfHwgdHlwZSAhPSBcIm9iamVjdFwiICYmIHR5cGUgIT0gXCJmdW5jdGlvblwiO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBVbmlxdWVJREdlbmVyZXRvcjtcblxuLyoqKi8gfSksXG4vKiAxNSAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcblxuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxudmFyIExheW91dENvbnN0YW50cyA9IF9fd2VicGFja19yZXF1aXJlX18oMCk7XG52YXIgTEdyYXBoTWFuYWdlciA9IF9fd2VicGFja19yZXF1aXJlX18oNik7XG52YXIgTE5vZGUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDMpO1xudmFyIExFZGdlID0gX193ZWJwYWNrX3JlcXVpcmVfXygxKTtcbnZhciBMR3JhcGggPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDUpO1xudmFyIFBvaW50RCA9IF9fd2VicGFja19yZXF1aXJlX18oNCk7XG52YXIgVHJhbnNmb3JtID0gX193ZWJwYWNrX3JlcXVpcmVfXygxNyk7XG52YXIgRW1pdHRlciA9IF9fd2VicGFja19yZXF1aXJlX18oMjcpO1xuXG5mdW5jdGlvbiBMYXlvdXQoaXNSZW1vdGVVc2UpIHtcbiAgRW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gIC8vTGF5b3V0IFF1YWxpdHk6IDA6ZHJhZnQsIDE6ZGVmYXVsdCwgMjpwcm9vZlxuICB0aGlzLmxheW91dFF1YWxpdHkgPSBMYXlvdXRDb25zdGFudHMuUVVBTElUWTtcbiAgLy9XaGV0aGVyIGxheW91dCBzaG91bGQgY3JlYXRlIGJlbmRwb2ludHMgYXMgbmVlZGVkIG9yIG5vdFxuICB0aGlzLmNyZWF0ZUJlbmRzQXNOZWVkZWQgPSBMYXlvdXRDb25zdGFudHMuREVGQVVMVF9DUkVBVEVfQkVORFNfQVNfTkVFREVEO1xuICAvL1doZXRoZXIgbGF5b3V0IHNob3VsZCBiZSBpbmNyZW1lbnRhbCBvciBub3RcbiAgdGhpcy5pbmNyZW1lbnRhbCA9IExheW91dENvbnN0YW50cy5ERUZBVUxUX0lOQ1JFTUVOVEFMO1xuICAvL1doZXRoZXIgd2UgYW5pbWF0ZSBmcm9tIGJlZm9yZSB0byBhZnRlciBsYXlvdXQgbm9kZSBwb3NpdGlvbnNcbiAgdGhpcy5hbmltYXRpb25PbkxheW91dCA9IExheW91dENvbnN0YW50cy5ERUZBVUxUX0FOSU1BVElPTl9PTl9MQVlPVVQ7XG4gIC8vV2hldGhlciB3ZSBhbmltYXRlIHRoZSBsYXlvdXQgcHJvY2VzcyBvciBub3RcbiAgdGhpcy5hbmltYXRpb25EdXJpbmdMYXlvdXQgPSBMYXlvdXRDb25zdGFudHMuREVGQVVMVF9BTklNQVRJT05fRFVSSU5HX0xBWU9VVDtcbiAgLy9OdW1iZXIgaXRlcmF0aW9ucyB0aGF0IHNob3VsZCBiZSBkb25lIGJldHdlZW4gdHdvIHN1Y2Nlc3NpdmUgYW5pbWF0aW9uc1xuICB0aGlzLmFuaW1hdGlvblBlcmlvZCA9IExheW91dENvbnN0YW50cy5ERUZBVUxUX0FOSU1BVElPTl9QRVJJT0Q7XG4gIC8qKlxyXG4gICAqIFdoZXRoZXIgb3Igbm90IGxlYWYgbm9kZXMgKG5vbi1jb21wb3VuZCBub2RlcykgYXJlIG9mIHVuaWZvcm0gc2l6ZXMuIFdoZW5cclxuICAgKiB0aGV5IGFyZSwgYm90aCBzcHJpbmcgYW5kIHJlcHVsc2lvbiBmb3JjZXMgYmV0d2VlbiB0d28gbGVhZiBub2RlcyBjYW4gYmVcclxuICAgKiBjYWxjdWxhdGVkIHdpdGhvdXQgdGhlIGV4cGVuc2l2ZSBjbGlwcGluZyBwb2ludCBjYWxjdWxhdGlvbnMsIHJlc3VsdGluZ1xyXG4gICAqIGluIG1ham9yIHNwZWVkLXVwLlxyXG4gICAqL1xuICB0aGlzLnVuaWZvcm1MZWFmTm9kZVNpemVzID0gTGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfVU5JRk9STV9MRUFGX05PREVfU0laRVM7XG4gIC8qKlxyXG4gICAqIFRoaXMgaXMgdXNlZCBmb3IgY3JlYXRpb24gb2YgYmVuZHBvaW50cyBieSB1c2luZyBkdW1teSBub2RlcyBhbmQgZWRnZXMuXHJcbiAgICogTWFwcyBhbiBMRWRnZSB0byBpdHMgZHVtbXkgYmVuZHBvaW50IHBhdGguXHJcbiAgICovXG4gIHRoaXMuZWRnZVRvRHVtbXlOb2RlcyA9IG5ldyBNYXAoKTtcbiAgdGhpcy5ncmFwaE1hbmFnZXIgPSBuZXcgTEdyYXBoTWFuYWdlcih0aGlzKTtcbiAgdGhpcy5pc0xheW91dEZpbmlzaGVkID0gZmFsc2U7XG4gIHRoaXMuaXNTdWJMYXlvdXQgPSBmYWxzZTtcbiAgdGhpcy5pc1JlbW90ZVVzZSA9IGZhbHNlO1xuXG4gIGlmIChpc1JlbW90ZVVzZSAhPSBudWxsKSB7XG4gICAgdGhpcy5pc1JlbW90ZVVzZSA9IGlzUmVtb3RlVXNlO1xuICB9XG59XG5cbkxheW91dC5SQU5ET01fU0VFRCA9IDE7XG5cbkxheW91dC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVtaXR0ZXIucHJvdG90eXBlKTtcblxuTGF5b3V0LnByb3RvdHlwZS5nZXRHcmFwaE1hbmFnZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmdyYXBoTWFuYWdlcjtcbn07XG5cbkxheW91dC5wcm90b3R5cGUuZ2V0QWxsTm9kZXMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmdyYXBoTWFuYWdlci5nZXRBbGxOb2RlcygpO1xufTtcblxuTGF5b3V0LnByb3RvdHlwZS5nZXRBbGxFZGdlcyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZ3JhcGhNYW5hZ2VyLmdldEFsbEVkZ2VzKCk7XG59O1xuXG5MYXlvdXQucHJvdG90eXBlLmdldEFsbE5vZGVzVG9BcHBseUdyYXZpdGF0aW9uID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5ncmFwaE1hbmFnZXIuZ2V0QWxsTm9kZXNUb0FwcGx5R3Jhdml0YXRpb24oKTtcbn07XG5cbkxheW91dC5wcm90b3R5cGUubmV3R3JhcGhNYW5hZ2VyID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZ20gPSBuZXcgTEdyYXBoTWFuYWdlcih0aGlzKTtcbiAgdGhpcy5ncmFwaE1hbmFnZXIgPSBnbTtcbiAgcmV0dXJuIGdtO1xufTtcblxuTGF5b3V0LnByb3RvdHlwZS5uZXdHcmFwaCA9IGZ1bmN0aW9uICh2R3JhcGgpIHtcbiAgcmV0dXJuIG5ldyBMR3JhcGgobnVsbCwgdGhpcy5ncmFwaE1hbmFnZXIsIHZHcmFwaCk7XG59O1xuXG5MYXlvdXQucHJvdG90eXBlLm5ld05vZGUgPSBmdW5jdGlvbiAodk5vZGUpIHtcbiAgcmV0dXJuIG5ldyBMTm9kZSh0aGlzLmdyYXBoTWFuYWdlciwgdk5vZGUpO1xufTtcblxuTGF5b3V0LnByb3RvdHlwZS5uZXdFZGdlID0gZnVuY3Rpb24gKHZFZGdlKSB7XG4gIHJldHVybiBuZXcgTEVkZ2UobnVsbCwgbnVsbCwgdkVkZ2UpO1xufTtcblxuTGF5b3V0LnByb3RvdHlwZS5jaGVja0xheW91dFN1Y2Nlc3MgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmdyYXBoTWFuYWdlci5nZXRSb290KCkgPT0gbnVsbCB8fCB0aGlzLmdyYXBoTWFuYWdlci5nZXRSb290KCkuZ2V0Tm9kZXMoKS5sZW5ndGggPT0gMCB8fCB0aGlzLmdyYXBoTWFuYWdlci5pbmNsdWRlc0ludmFsaWRFZGdlKCk7XG59O1xuXG5MYXlvdXQucHJvdG90eXBlLnJ1bkxheW91dCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5pc0xheW91dEZpbmlzaGVkID0gZmFsc2U7XG5cbiAgaWYgKHRoaXMudGlsaW5nUHJlTGF5b3V0KSB7XG4gICAgdGhpcy50aWxpbmdQcmVMYXlvdXQoKTtcbiAgfVxuXG4gIHRoaXMuaW5pdFBhcmFtZXRlcnMoKTtcbiAgdmFyIGlzTGF5b3V0U3VjY2Vzc2Z1bGw7XG5cbiAgaWYgKHRoaXMuY2hlY2tMYXlvdXRTdWNjZXNzKCkpIHtcbiAgICBpc0xheW91dFN1Y2Nlc3NmdWxsID0gZmFsc2U7XG4gIH0gZWxzZSB7XG4gICAgaXNMYXlvdXRTdWNjZXNzZnVsbCA9IHRoaXMubGF5b3V0KCk7XG4gIH1cblxuICBpZiAoTGF5b3V0Q29uc3RhbnRzLkFOSU1BVEUgPT09ICdkdXJpbmcnKSB7XG4gICAgLy8gSWYgdGhpcyBpcyBhICdkdXJpbmcnIGxheW91dCBhbmltYXRpb24uIExheW91dCBpcyBub3QgZmluaXNoZWQgeWV0LiBcbiAgICAvLyBXZSBuZWVkIHRvIHBlcmZvcm0gdGhlc2UgaW4gaW5kZXguanMgd2hlbiBsYXlvdXQgaXMgcmVhbGx5IGZpbmlzaGVkLlxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChpc0xheW91dFN1Y2Nlc3NmdWxsKSB7XG4gICAgaWYgKCF0aGlzLmlzU3ViTGF5b3V0KSB7XG4gICAgICB0aGlzLmRvUG9zdExheW91dCgpO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0aGlzLnRpbGluZ1Bvc3RMYXlvdXQpIHtcbiAgICB0aGlzLnRpbGluZ1Bvc3RMYXlvdXQoKTtcbiAgfVxuXG4gIHRoaXMuaXNMYXlvdXRGaW5pc2hlZCA9IHRydWU7XG5cbiAgcmV0dXJuIGlzTGF5b3V0U3VjY2Vzc2Z1bGw7XG59O1xuXG4vKipcclxuICogVGhpcyBtZXRob2QgcGVyZm9ybXMgdGhlIG9wZXJhdGlvbnMgcmVxdWlyZWQgYWZ0ZXIgbGF5b3V0LlxyXG4gKi9cbkxheW91dC5wcm90b3R5cGUuZG9Qb3N0TGF5b3V0ID0gZnVuY3Rpb24gKCkge1xuICAvL2Fzc2VydCAhaXNTdWJMYXlvdXQgOiBcIlNob3VsZCBub3QgYmUgY2FsbGVkIG9uIHN1Yi1sYXlvdXQhXCI7XG4gIC8vIFByb3BhZ2F0ZSBnZW9tZXRyaWMgY2hhbmdlcyB0byB2LWxldmVsIG9iamVjdHNcbiAgaWYgKCF0aGlzLmluY3JlbWVudGFsKSB7XG4gICAgdGhpcy50cmFuc2Zvcm0oKTtcbiAgfVxuICB0aGlzLnVwZGF0ZSgpO1xufTtcblxuLyoqXHJcbiAqIFRoaXMgbWV0aG9kIHVwZGF0ZXMgdGhlIGdlb21ldHJ5IG9mIHRoZSB0YXJnZXQgZ3JhcGggYWNjb3JkaW5nIHRvXHJcbiAqIGNhbGN1bGF0ZWQgbGF5b3V0LlxyXG4gKi9cbkxheW91dC5wcm90b3R5cGUudXBkYXRlMiA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gdXBkYXRlIGJlbmQgcG9pbnRzXG4gIGlmICh0aGlzLmNyZWF0ZUJlbmRzQXNOZWVkZWQpIHtcbiAgICB0aGlzLmNyZWF0ZUJlbmRwb2ludHNGcm9tRHVtbXlOb2RlcygpO1xuXG4gICAgLy8gcmVzZXQgYWxsIGVkZ2VzLCBzaW5jZSB0aGUgdG9wb2xvZ3kgaGFzIGNoYW5nZWRcbiAgICB0aGlzLmdyYXBoTWFuYWdlci5yZXNldEFsbEVkZ2VzKCk7XG4gIH1cblxuICAvLyBwZXJmb3JtIGVkZ2UsIG5vZGUgYW5kIHJvb3QgdXBkYXRlcyBpZiBsYXlvdXQgaXMgbm90IGNhbGxlZFxuICAvLyByZW1vdGVseVxuICBpZiAoIXRoaXMuaXNSZW1vdGVVc2UpIHtcbiAgICAvLyB1cGRhdGUgYWxsIGVkZ2VzXG4gICAgdmFyIGVkZ2U7XG4gICAgdmFyIGFsbEVkZ2VzID0gdGhpcy5ncmFwaE1hbmFnZXIuZ2V0QWxsRWRnZXMoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFsbEVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBlZGdlID0gYWxsRWRnZXNbaV07XG4gICAgICAvLyAgICAgIHRoaXMudXBkYXRlKGVkZ2UpO1xuICAgIH1cblxuICAgIC8vIHJlY3Vyc2l2ZWx5IHVwZGF0ZSBub2Rlc1xuICAgIHZhciBub2RlO1xuICAgIHZhciBub2RlcyA9IHRoaXMuZ3JhcGhNYW5hZ2VyLmdldFJvb3QoKS5nZXROb2RlcygpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG5vZGUgPSBub2Rlc1tpXTtcbiAgICAgIC8vICAgICAgdGhpcy51cGRhdGUobm9kZSk7XG4gICAgfVxuXG4gICAgLy8gdXBkYXRlIHJvb3QgZ3JhcGhcbiAgICB0aGlzLnVwZGF0ZSh0aGlzLmdyYXBoTWFuYWdlci5nZXRSb290KCkpO1xuICB9XG59O1xuXG5MYXlvdXQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgaWYgKG9iaiA9PSBudWxsKSB7XG4gICAgdGhpcy51cGRhdGUyKCk7XG4gIH0gZWxzZSBpZiAob2JqIGluc3RhbmNlb2YgTE5vZGUpIHtcbiAgICB2YXIgbm9kZSA9IG9iajtcbiAgICBpZiAobm9kZS5nZXRDaGlsZCgpICE9IG51bGwpIHtcbiAgICAgIC8vIHNpbmNlIG5vZGUgaXMgY29tcG91bmQsIHJlY3Vyc2l2ZWx5IHVwZGF0ZSBjaGlsZCBub2Rlc1xuICAgICAgdmFyIG5vZGVzID0gbm9kZS5nZXRDaGlsZCgpLmdldE5vZGVzKCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHVwZGF0ZShub2Rlc1tpXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gaWYgdGhlIGwtbGV2ZWwgbm9kZSBpcyBhc3NvY2lhdGVkIHdpdGggYSB2LWxldmVsIGdyYXBoIG9iamVjdCxcbiAgICAvLyB0aGVuIGl0IGlzIGFzc3VtZWQgdGhhdCB0aGUgdi1sZXZlbCBub2RlIGltcGxlbWVudHMgdGhlXG4gICAgLy8gaW50ZXJmYWNlIFVwZGF0YWJsZS5cbiAgICBpZiAobm9kZS52R3JhcGhPYmplY3QgIT0gbnVsbCkge1xuICAgICAgLy8gY2FzdCB0byBVcGRhdGFibGUgd2l0aG91dCBhbnkgdHlwZSBjaGVja1xuICAgICAgdmFyIHZOb2RlID0gbm9kZS52R3JhcGhPYmplY3Q7XG5cbiAgICAgIC8vIGNhbGwgdGhlIHVwZGF0ZSBtZXRob2Qgb2YgdGhlIGludGVyZmFjZVxuICAgICAgdk5vZGUudXBkYXRlKG5vZGUpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChvYmogaW5zdGFuY2VvZiBMRWRnZSkge1xuICAgIHZhciBlZGdlID0gb2JqO1xuICAgIC8vIGlmIHRoZSBsLWxldmVsIGVkZ2UgaXMgYXNzb2NpYXRlZCB3aXRoIGEgdi1sZXZlbCBncmFwaCBvYmplY3QsXG4gICAgLy8gdGhlbiBpdCBpcyBhc3N1bWVkIHRoYXQgdGhlIHYtbGV2ZWwgZWRnZSBpbXBsZW1lbnRzIHRoZVxuICAgIC8vIGludGVyZmFjZSBVcGRhdGFibGUuXG5cbiAgICBpZiAoZWRnZS52R3JhcGhPYmplY3QgIT0gbnVsbCkge1xuICAgICAgLy8gY2FzdCB0byBVcGRhdGFibGUgd2l0aG91dCBhbnkgdHlwZSBjaGVja1xuICAgICAgdmFyIHZFZGdlID0gZWRnZS52R3JhcGhPYmplY3Q7XG5cbiAgICAgIC8vIGNhbGwgdGhlIHVwZGF0ZSBtZXRob2Qgb2YgdGhlIGludGVyZmFjZVxuICAgICAgdkVkZ2UudXBkYXRlKGVkZ2UpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChvYmogaW5zdGFuY2VvZiBMR3JhcGgpIHtcbiAgICB2YXIgZ3JhcGggPSBvYmo7XG4gICAgLy8gaWYgdGhlIGwtbGV2ZWwgZ3JhcGggaXMgYXNzb2NpYXRlZCB3aXRoIGEgdi1sZXZlbCBncmFwaCBvYmplY3QsXG4gICAgLy8gdGhlbiBpdCBpcyBhc3N1bWVkIHRoYXQgdGhlIHYtbGV2ZWwgb2JqZWN0IGltcGxlbWVudHMgdGhlXG4gICAgLy8gaW50ZXJmYWNlIFVwZGF0YWJsZS5cblxuICAgIGlmIChncmFwaC52R3JhcGhPYmplY3QgIT0gbnVsbCkge1xuICAgICAgLy8gY2FzdCB0byBVcGRhdGFibGUgd2l0aG91dCBhbnkgdHlwZSBjaGVja1xuICAgICAgdmFyIHZHcmFwaCA9IGdyYXBoLnZHcmFwaE9iamVjdDtcblxuICAgICAgLy8gY2FsbCB0aGUgdXBkYXRlIG1ldGhvZCBvZiB0aGUgaW50ZXJmYWNlXG4gICAgICB2R3JhcGgudXBkYXRlKGdyYXBoKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxyXG4gKiBUaGlzIG1ldGhvZCBpcyB1c2VkIHRvIHNldCBhbGwgbGF5b3V0IHBhcmFtZXRlcnMgdG8gZGVmYXVsdCB2YWx1ZXNcclxuICogZGV0ZXJtaW5lZCBhdCBjb21waWxlIHRpbWUuXHJcbiAqL1xuTGF5b3V0LnByb3RvdHlwZS5pbml0UGFyYW1ldGVycyA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLmlzU3ViTGF5b3V0KSB7XG4gICAgdGhpcy5sYXlvdXRRdWFsaXR5ID0gTGF5b3V0Q29uc3RhbnRzLlFVQUxJVFk7XG4gICAgdGhpcy5hbmltYXRpb25EdXJpbmdMYXlvdXQgPSBMYXlvdXRDb25zdGFudHMuREVGQVVMVF9BTklNQVRJT05fRFVSSU5HX0xBWU9VVDtcbiAgICB0aGlzLmFuaW1hdGlvblBlcmlvZCA9IExheW91dENvbnN0YW50cy5ERUZBVUxUX0FOSU1BVElPTl9QRVJJT0Q7XG4gICAgdGhpcy5hbmltYXRpb25PbkxheW91dCA9IExheW91dENvbnN0YW50cy5ERUZBVUxUX0FOSU1BVElPTl9PTl9MQVlPVVQ7XG4gICAgdGhpcy5pbmNyZW1lbnRhbCA9IExheW91dENvbnN0YW50cy5ERUZBVUxUX0lOQ1JFTUVOVEFMO1xuICAgIHRoaXMuY3JlYXRlQmVuZHNBc05lZWRlZCA9IExheW91dENvbnN0YW50cy5ERUZBVUxUX0NSRUFURV9CRU5EU19BU19ORUVERUQ7XG4gICAgdGhpcy51bmlmb3JtTGVhZk5vZGVTaXplcyA9IExheW91dENvbnN0YW50cy5ERUZBVUxUX1VOSUZPUk1fTEVBRl9OT0RFX1NJWkVTO1xuICB9XG5cbiAgaWYgKHRoaXMuYW5pbWF0aW9uRHVyaW5nTGF5b3V0KSB7XG4gICAgdGhpcy5hbmltYXRpb25PbkxheW91dCA9IGZhbHNlO1xuICB9XG59O1xuXG5MYXlvdXQucHJvdG90eXBlLnRyYW5zZm9ybSA9IGZ1bmN0aW9uIChuZXdMZWZ0VG9wKSB7XG4gIGlmIChuZXdMZWZ0VG9wID09IHVuZGVmaW5lZCkge1xuICAgIHRoaXMudHJhbnNmb3JtKG5ldyBQb2ludEQoMCwgMCkpO1xuICB9IGVsc2Uge1xuICAgIC8vIGNyZWF0ZSBhIHRyYW5zZm9ybWF0aW9uIG9iamVjdCAoZnJvbSBFY2xpcHNlIHRvIGxheW91dCkuIFdoZW4gYW5cbiAgICAvLyBpbnZlcnNlIHRyYW5zZm9ybSBpcyBhcHBsaWVkLCB3ZSBnZXQgdXBwZXItbGVmdCBjb29yZGluYXRlIG9mIHRoZVxuICAgIC8vIGRyYXdpbmcgb3IgdGhlIHJvb3QgZ3JhcGggYXQgZ2l2ZW4gaW5wdXQgY29vcmRpbmF0ZSAoc29tZSBtYXJnaW5zXG4gICAgLy8gYWxyZWFkeSBpbmNsdWRlZCBpbiBjYWxjdWxhdGlvbiBvZiBsZWZ0LXRvcCkuXG5cbiAgICB2YXIgdHJhbnMgPSBuZXcgVHJhbnNmb3JtKCk7XG4gICAgdmFyIGxlZnRUb3AgPSB0aGlzLmdyYXBoTWFuYWdlci5nZXRSb290KCkudXBkYXRlTGVmdFRvcCgpO1xuXG4gICAgaWYgKGxlZnRUb3AgIT0gbnVsbCkge1xuICAgICAgdHJhbnMuc2V0V29ybGRPcmdYKG5ld0xlZnRUb3AueCk7XG4gICAgICB0cmFucy5zZXRXb3JsZE9yZ1kobmV3TGVmdFRvcC55KTtcblxuICAgICAgdHJhbnMuc2V0RGV2aWNlT3JnWChsZWZ0VG9wLngpO1xuICAgICAgdHJhbnMuc2V0RGV2aWNlT3JnWShsZWZ0VG9wLnkpO1xuXG4gICAgICB2YXIgbm9kZXMgPSB0aGlzLmdldEFsbE5vZGVzKCk7XG4gICAgICB2YXIgbm9kZTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBub2RlID0gbm9kZXNbaV07XG4gICAgICAgIG5vZGUudHJhbnNmb3JtKHRyYW5zKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbkxheW91dC5wcm90b3R5cGUucG9zaXRpb25Ob2Rlc1JhbmRvbWx5ID0gZnVuY3Rpb24gKGdyYXBoKSB7XG5cbiAgaWYgKGdyYXBoID09IHVuZGVmaW5lZCkge1xuICAgIC8vYXNzZXJ0ICF0aGlzLmluY3JlbWVudGFsO1xuICAgIHRoaXMucG9zaXRpb25Ob2Rlc1JhbmRvbWx5KHRoaXMuZ2V0R3JhcGhNYW5hZ2VyKCkuZ2V0Um9vdCgpKTtcbiAgICB0aGlzLmdldEdyYXBoTWFuYWdlcigpLmdldFJvb3QoKS51cGRhdGVCb3VuZHModHJ1ZSk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGxOb2RlO1xuICAgIHZhciBjaGlsZEdyYXBoO1xuXG4gICAgdmFyIG5vZGVzID0gZ3JhcGguZ2V0Tm9kZXMoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsTm9kZSA9IG5vZGVzW2ldO1xuICAgICAgY2hpbGRHcmFwaCA9IGxOb2RlLmdldENoaWxkKCk7XG5cbiAgICAgIGlmIChjaGlsZEdyYXBoID09IG51bGwpIHtcbiAgICAgICAgbE5vZGUuc2NhdHRlcigpO1xuICAgICAgfSBlbHNlIGlmIChjaGlsZEdyYXBoLmdldE5vZGVzKCkubGVuZ3RoID09IDApIHtcbiAgICAgICAgbE5vZGUuc2NhdHRlcigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvbk5vZGVzUmFuZG9tbHkoY2hpbGRHcmFwaCk7XG4gICAgICAgIGxOb2RlLnVwZGF0ZUJvdW5kcygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuLyoqXHJcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgYSBsaXN0IG9mIHRyZWVzIHdoZXJlIGVhY2ggdHJlZSBpcyByZXByZXNlbnRlZCBhcyBhXHJcbiAqIGxpc3Qgb2YgbC1ub2Rlcy4gVGhlIG1ldGhvZCByZXR1cm5zIGEgbGlzdCBvZiBzaXplIDAgd2hlbjpcclxuICogLSBUaGUgZ3JhcGggaXMgbm90IGZsYXQgb3JcclxuICogLSBPbmUgb2YgdGhlIGNvbXBvbmVudChzKSBvZiB0aGUgZ3JhcGggaXMgbm90IGEgdHJlZS5cclxuICovXG5MYXlvdXQucHJvdG90eXBlLmdldEZsYXRGb3Jlc3QgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBmbGF0Rm9yZXN0ID0gW107XG4gIHZhciBpc0ZvcmVzdCA9IHRydWU7XG5cbiAgLy8gUXVpY2sgcmVmZXJlbmNlIGZvciBhbGwgbm9kZXMgaW4gdGhlIGdyYXBoIG1hbmFnZXIgYXNzb2NpYXRlZCB3aXRoXG4gIC8vIHRoaXMgbGF5b3V0LiBUaGUgbGlzdCBzaG91bGQgbm90IGJlIGNoYW5nZWQuXG4gIHZhciBhbGxOb2RlcyA9IHRoaXMuZ3JhcGhNYW5hZ2VyLmdldFJvb3QoKS5nZXROb2RlcygpO1xuXG4gIC8vIEZpcnN0IGJlIHN1cmUgdGhhdCB0aGUgZ3JhcGggaXMgZmxhdFxuICB2YXIgaXNGbGF0ID0gdHJ1ZTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFsbE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGFsbE5vZGVzW2ldLmdldENoaWxkKCkgIT0gbnVsbCkge1xuICAgICAgaXNGbGF0ID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLy8gUmV0dXJuIGVtcHR5IGZvcmVzdCBpZiB0aGUgZ3JhcGggaXMgbm90IGZsYXQuXG4gIGlmICghaXNGbGF0KSB7XG4gICAgcmV0dXJuIGZsYXRGb3Jlc3Q7XG4gIH1cblxuICAvLyBSdW4gQkZTIGZvciBlYWNoIGNvbXBvbmVudCBvZiB0aGUgZ3JhcGguXG5cbiAgdmFyIHZpc2l0ZWQgPSBuZXcgU2V0KCk7XG4gIHZhciB0b0JlVmlzaXRlZCA9IFtdO1xuICB2YXIgcGFyZW50cyA9IG5ldyBNYXAoKTtcbiAgdmFyIHVuUHJvY2Vzc2VkTm9kZXMgPSBbXTtcblxuICB1blByb2Nlc3NlZE5vZGVzID0gdW5Qcm9jZXNzZWROb2Rlcy5jb25jYXQoYWxsTm9kZXMpO1xuXG4gIC8vIEVhY2ggaXRlcmF0aW9uIG9mIHRoaXMgbG9vcCBmaW5kcyBhIGNvbXBvbmVudCBvZiB0aGUgZ3JhcGggYW5kXG4gIC8vIGRlY2lkZXMgd2hldGhlciBpdCBpcyBhIHRyZWUgb3Igbm90LiBJZiBpdCBpcyBhIHRyZWUsIGFkZHMgaXQgdG8gdGhlXG4gIC8vIGZvcmVzdCBhbmQgY29udGludWVkIHdpdGggdGhlIG5leHQgY29tcG9uZW50LlxuXG4gIHdoaWxlICh1blByb2Nlc3NlZE5vZGVzLmxlbmd0aCA+IDAgJiYgaXNGb3Jlc3QpIHtcbiAgICB0b0JlVmlzaXRlZC5wdXNoKHVuUHJvY2Vzc2VkTm9kZXNbMF0pO1xuXG4gICAgLy8gU3RhcnQgdGhlIEJGUy4gRWFjaCBpdGVyYXRpb24gb2YgdGhpcyBsb29wIHZpc2l0cyBhIG5vZGUgaW4gYVxuICAgIC8vIEJGUyBtYW5uZXIuXG4gICAgd2hpbGUgKHRvQmVWaXNpdGVkLmxlbmd0aCA+IDAgJiYgaXNGb3Jlc3QpIHtcbiAgICAgIC8vcG9vbCBvcGVyYXRpb25cbiAgICAgIHZhciBjdXJyZW50Tm9kZSA9IHRvQmVWaXNpdGVkWzBdO1xuICAgICAgdG9CZVZpc2l0ZWQuc3BsaWNlKDAsIDEpO1xuICAgICAgdmlzaXRlZC5hZGQoY3VycmVudE5vZGUpO1xuXG4gICAgICAvLyBUcmF2ZXJzZSBhbGwgbmVpZ2hib3JzIG9mIHRoaXMgbm9kZVxuICAgICAgdmFyIG5laWdoYm9yRWRnZXMgPSBjdXJyZW50Tm9kZS5nZXRFZGdlcygpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5laWdoYm9yRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGN1cnJlbnROZWlnaGJvciA9IG5laWdoYm9yRWRnZXNbaV0uZ2V0T3RoZXJFbmQoY3VycmVudE5vZGUpO1xuXG4gICAgICAgIC8vIElmIEJGUyBpcyBub3QgZ3Jvd2luZyBmcm9tIHRoaXMgbmVpZ2hib3IuXG4gICAgICAgIGlmIChwYXJlbnRzLmdldChjdXJyZW50Tm9kZSkgIT0gY3VycmVudE5laWdoYm9yKSB7XG4gICAgICAgICAgLy8gV2UgaGF2ZW4ndCBwcmV2aW91c2x5IHZpc2l0ZWQgdGhpcyBuZWlnaGJvci5cbiAgICAgICAgICBpZiAoIXZpc2l0ZWQuaGFzKGN1cnJlbnROZWlnaGJvcikpIHtcbiAgICAgICAgICAgIHRvQmVWaXNpdGVkLnB1c2goY3VycmVudE5laWdoYm9yKTtcbiAgICAgICAgICAgIHBhcmVudHMuc2V0KGN1cnJlbnROZWlnaGJvciwgY3VycmVudE5vZGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBTaW5jZSB3ZSBoYXZlIHByZXZpb3VzbHkgdmlzaXRlZCB0aGlzIG5laWdoYm9yIGFuZFxuICAgICAgICAgIC8vIHRoaXMgbmVpZ2hib3IgaXMgbm90IHBhcmVudCBvZiBjdXJyZW50Tm9kZSwgZ2l2ZW5cbiAgICAgICAgICAvLyBncmFwaCBjb250YWlucyBhIGNvbXBvbmVudCB0aGF0IGlzIG5vdCB0cmVlLCBoZW5jZVxuICAgICAgICAgIC8vIGl0IGlzIG5vdCBhIGZvcmVzdC5cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgaXNGb3Jlc3QgPSBmYWxzZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUaGUgZ3JhcGggY29udGFpbnMgYSBjb21wb25lbnQgdGhhdCBpcyBub3QgYSB0cmVlLiBFbXB0eVxuICAgIC8vIHByZXZpb3VzbHkgZm91bmQgdHJlZXMuIFRoZSBtZXRob2Qgd2lsbCBlbmQuXG4gICAgaWYgKCFpc0ZvcmVzdCkge1xuICAgICAgZmxhdEZvcmVzdCA9IFtdO1xuICAgIH1cbiAgICAvLyBTYXZlIGN1cnJlbnRseSB2aXNpdGVkIG5vZGVzIGFzIGEgdHJlZSBpbiBvdXIgZm9yZXN0LiBSZXNldFxuICAgIC8vIHZpc2l0ZWQgYW5kIHBhcmVudHMgbGlzdHMuIENvbnRpbnVlIHdpdGggdGhlIG5leHQgY29tcG9uZW50IG9mXG4gICAgLy8gdGhlIGdyYXBoLCBpZiBhbnkuXG4gICAgZWxzZSB7XG4gICAgICAgIHZhciB0ZW1wID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh2aXNpdGVkKSk7XG4gICAgICAgIGZsYXRGb3Jlc3QucHVzaCh0ZW1wKTtcbiAgICAgICAgLy9mbGF0Rm9yZXN0ID0gZmxhdEZvcmVzdC5jb25jYXQodGVtcCk7XG4gICAgICAgIC8vdW5Qcm9jZXNzZWROb2Rlcy5yZW1vdmVBbGwodmlzaXRlZCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGVtcC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciB2YWx1ZSA9IHRlbXBbaV07XG4gICAgICAgICAgdmFyIGluZGV4ID0gdW5Qcm9jZXNzZWROb2Rlcy5pbmRleE9mKHZhbHVlKTtcbiAgICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgdW5Qcm9jZXNzZWROb2Rlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2aXNpdGVkID0gbmV3IFNldCgpO1xuICAgICAgICBwYXJlbnRzID0gbmV3IE1hcCgpO1xuICAgICAgfVxuICB9XG5cbiAgcmV0dXJuIGZsYXRGb3Jlc3Q7XG59O1xuXG4vKipcclxuICogVGhpcyBtZXRob2QgY3JlYXRlcyBkdW1teSBub2RlcyAoYW4gbC1sZXZlbCBub2RlIHdpdGggbWluaW1hbCBkaW1lbnNpb25zKVxyXG4gKiBmb3IgdGhlIGdpdmVuIGVkZ2UgKG9uZSBwZXIgYmVuZHBvaW50KS4gVGhlIGV4aXN0aW5nIGwtbGV2ZWwgc3RydWN0dXJlXHJcbiAqIGlzIHVwZGF0ZWQgYWNjb3JkaW5nbHkuXHJcbiAqL1xuTGF5b3V0LnByb3RvdHlwZS5jcmVhdGVEdW1teU5vZGVzRm9yQmVuZHBvaW50cyA9IGZ1bmN0aW9uIChlZGdlKSB7XG4gIHZhciBkdW1teU5vZGVzID0gW107XG4gIHZhciBwcmV2ID0gZWRnZS5zb3VyY2U7XG5cbiAgdmFyIGdyYXBoID0gdGhpcy5ncmFwaE1hbmFnZXIuY2FsY0xvd2VzdENvbW1vbkFuY2VzdG9yKGVkZ2Uuc291cmNlLCBlZGdlLnRhcmdldCk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlZGdlLmJlbmRwb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBjcmVhdGUgbmV3IGR1bW15IG5vZGVcbiAgICB2YXIgZHVtbXlOb2RlID0gdGhpcy5uZXdOb2RlKG51bGwpO1xuICAgIGR1bW15Tm9kZS5zZXRSZWN0KG5ldyBQb2ludCgwLCAwKSwgbmV3IERpbWVuc2lvbigxLCAxKSk7XG5cbiAgICBncmFwaC5hZGQoZHVtbXlOb2RlKTtcblxuICAgIC8vIGNyZWF0ZSBuZXcgZHVtbXkgZWRnZSBiZXR3ZWVuIHByZXYgYW5kIGR1bW15IG5vZGVcbiAgICB2YXIgZHVtbXlFZGdlID0gdGhpcy5uZXdFZGdlKG51bGwpO1xuICAgIHRoaXMuZ3JhcGhNYW5hZ2VyLmFkZChkdW1teUVkZ2UsIHByZXYsIGR1bW15Tm9kZSk7XG5cbiAgICBkdW1teU5vZGVzLmFkZChkdW1teU5vZGUpO1xuICAgIHByZXYgPSBkdW1teU5vZGU7XG4gIH1cblxuICB2YXIgZHVtbXlFZGdlID0gdGhpcy5uZXdFZGdlKG51bGwpO1xuICB0aGlzLmdyYXBoTWFuYWdlci5hZGQoZHVtbXlFZGdlLCBwcmV2LCBlZGdlLnRhcmdldCk7XG5cbiAgdGhpcy5lZGdlVG9EdW1teU5vZGVzLnNldChlZGdlLCBkdW1teU5vZGVzKTtcblxuICAvLyByZW1vdmUgcmVhbCBlZGdlIGZyb20gZ3JhcGggbWFuYWdlciBpZiBpdCBpcyBpbnRlci1ncmFwaFxuICBpZiAoZWRnZS5pc0ludGVyR3JhcGgoKSkge1xuICAgIHRoaXMuZ3JhcGhNYW5hZ2VyLnJlbW92ZShlZGdlKTtcbiAgfVxuICAvLyBlbHNlLCByZW1vdmUgdGhlIGVkZ2UgZnJvbSB0aGUgY3VycmVudCBncmFwaFxuICBlbHNlIHtcbiAgICAgIGdyYXBoLnJlbW92ZShlZGdlKTtcbiAgICB9XG5cbiAgcmV0dXJuIGR1bW15Tm9kZXM7XG59O1xuXG4vKipcclxuICogVGhpcyBtZXRob2QgY3JlYXRlcyBiZW5kcG9pbnRzIGZvciBlZGdlcyBmcm9tIHRoZSBkdW1teSBub2Rlc1xyXG4gKiBhdCBsLWxldmVsLlxyXG4gKi9cbkxheW91dC5wcm90b3R5cGUuY3JlYXRlQmVuZHBvaW50c0Zyb21EdW1teU5vZGVzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZWRnZXMgPSBbXTtcbiAgZWRnZXMgPSBlZGdlcy5jb25jYXQodGhpcy5ncmFwaE1hbmFnZXIuZ2V0QWxsRWRnZXMoKSk7XG4gIGVkZ2VzID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLmVkZ2VUb0R1bW15Tm9kZXMua2V5cygpKSkuY29uY2F0KGVkZ2VzKTtcblxuICBmb3IgKHZhciBrID0gMDsgayA8IGVkZ2VzLmxlbmd0aDsgaysrKSB7XG4gICAgdmFyIGxFZGdlID0gZWRnZXNba107XG5cbiAgICBpZiAobEVkZ2UuYmVuZHBvaW50cy5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgcGF0aCA9IHRoaXMuZWRnZVRvRHVtbXlOb2Rlcy5nZXQobEVkZ2UpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGR1bW15Tm9kZSA9IHBhdGhbaV07XG4gICAgICAgIHZhciBwID0gbmV3IFBvaW50RChkdW1teU5vZGUuZ2V0Q2VudGVyWCgpLCBkdW1teU5vZGUuZ2V0Q2VudGVyWSgpKTtcblxuICAgICAgICAvLyB1cGRhdGUgYmVuZHBvaW50J3MgbG9jYXRpb24gYWNjb3JkaW5nIHRvIGR1bW15IG5vZGVcbiAgICAgICAgdmFyIGVicCA9IGxFZGdlLmJlbmRwb2ludHMuZ2V0KGkpO1xuICAgICAgICBlYnAueCA9IHAueDtcbiAgICAgICAgZWJwLnkgPSBwLnk7XG5cbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBkdW1teSBub2RlLCBkdW1teSBlZGdlcyBpbmNpZGVudCB3aXRoIHRoaXNcbiAgICAgICAgLy8gZHVtbXkgbm9kZSBpcyBhbHNvIHJlbW92ZWQgKHdpdGhpbiB0aGUgcmVtb3ZlIG1ldGhvZClcbiAgICAgICAgZHVtbXlOb2RlLmdldE93bmVyKCkucmVtb3ZlKGR1bW15Tm9kZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIGFkZCB0aGUgcmVhbCBlZGdlIHRvIGdyYXBoXG4gICAgICB0aGlzLmdyYXBoTWFuYWdlci5hZGQobEVkZ2UsIGxFZGdlLnNvdXJjZSwgbEVkZ2UudGFyZ2V0KTtcbiAgICB9XG4gIH1cbn07XG5cbkxheW91dC50cmFuc2Zvcm0gPSBmdW5jdGlvbiAoc2xpZGVyVmFsdWUsIGRlZmF1bHRWYWx1ZSwgbWluRGl2LCBtYXhNdWwpIHtcbiAgaWYgKG1pbkRpdiAhPSB1bmRlZmluZWQgJiYgbWF4TXVsICE9IHVuZGVmaW5lZCkge1xuICAgIHZhciB2YWx1ZSA9IGRlZmF1bHRWYWx1ZTtcblxuICAgIGlmIChzbGlkZXJWYWx1ZSA8PSA1MCkge1xuICAgICAgdmFyIG1pblZhbHVlID0gZGVmYXVsdFZhbHVlIC8gbWluRGl2O1xuICAgICAgdmFsdWUgLT0gKGRlZmF1bHRWYWx1ZSAtIG1pblZhbHVlKSAvIDUwICogKDUwIC0gc2xpZGVyVmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgbWF4VmFsdWUgPSBkZWZhdWx0VmFsdWUgKiBtYXhNdWw7XG4gICAgICB2YWx1ZSArPSAobWF4VmFsdWUgLSBkZWZhdWx0VmFsdWUpIC8gNTAgKiAoc2xpZGVyVmFsdWUgLSA1MCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlO1xuICB9IGVsc2Uge1xuICAgIHZhciBhLCBiO1xuXG4gICAgaWYgKHNsaWRlclZhbHVlIDw9IDUwKSB7XG4gICAgICBhID0gOS4wICogZGVmYXVsdFZhbHVlIC8gNTAwLjA7XG4gICAgICBiID0gZGVmYXVsdFZhbHVlIC8gMTAuMDtcbiAgICB9IGVsc2Uge1xuICAgICAgYSA9IDkuMCAqIGRlZmF1bHRWYWx1ZSAvIDUwLjA7XG4gICAgICBiID0gLTggKiBkZWZhdWx0VmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGEgKiBzbGlkZXJWYWx1ZSArIGI7XG4gIH1cbn07XG5cbi8qKlxyXG4gKiBUaGlzIG1ldGhvZCBmaW5kcyBhbmQgcmV0dXJucyB0aGUgY2VudGVyIG9mIHRoZSBnaXZlbiBub2RlcywgYXNzdW1pbmdcclxuICogdGhhdCB0aGUgZ2l2ZW4gbm9kZXMgZm9ybSBhIHRyZWUgaW4gdGhlbXNlbHZlcy5cclxuICovXG5MYXlvdXQuZmluZENlbnRlck9mVHJlZSA9IGZ1bmN0aW9uIChub2Rlcykge1xuICB2YXIgbGlzdCA9IFtdO1xuICBsaXN0ID0gbGlzdC5jb25jYXQobm9kZXMpO1xuXG4gIHZhciByZW1vdmVkTm9kZXMgPSBbXTtcbiAgdmFyIHJlbWFpbmluZ0RlZ3JlZXMgPSBuZXcgTWFwKCk7XG4gIHZhciBmb3VuZENlbnRlciA9IGZhbHNlO1xuICB2YXIgY2VudGVyTm9kZSA9IG51bGw7XG5cbiAgaWYgKGxpc3QubGVuZ3RoID09IDEgfHwgbGlzdC5sZW5ndGggPT0gMikge1xuICAgIGZvdW5kQ2VudGVyID0gdHJ1ZTtcbiAgICBjZW50ZXJOb2RlID0gbGlzdFswXTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBub2RlID0gbGlzdFtpXTtcbiAgICB2YXIgZGVncmVlID0gbm9kZS5nZXROZWlnaGJvcnNMaXN0KCkuc2l6ZTtcbiAgICByZW1haW5pbmdEZWdyZWVzLnNldChub2RlLCBub2RlLmdldE5laWdoYm9yc0xpc3QoKS5zaXplKTtcblxuICAgIGlmIChkZWdyZWUgPT0gMSkge1xuICAgICAgcmVtb3ZlZE5vZGVzLnB1c2gobm9kZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIHRlbXBMaXN0ID0gW107XG4gIHRlbXBMaXN0ID0gdGVtcExpc3QuY29uY2F0KHJlbW92ZWROb2Rlcyk7XG5cbiAgd2hpbGUgKCFmb3VuZENlbnRlcikge1xuICAgIHZhciB0ZW1wTGlzdDIgPSBbXTtcbiAgICB0ZW1wTGlzdDIgPSB0ZW1wTGlzdDIuY29uY2F0KHRlbXBMaXN0KTtcbiAgICB0ZW1wTGlzdCA9IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbm9kZSA9IGxpc3RbaV07XG5cbiAgICAgIHZhciBpbmRleCA9IGxpc3QuaW5kZXhPZihub2RlKTtcbiAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgIGxpc3Quc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cblxuICAgICAgdmFyIG5laWdoYm91cnMgPSBub2RlLmdldE5laWdoYm9yc0xpc3QoKTtcblxuICAgICAgbmVpZ2hib3Vycy5mb3JFYWNoKGZ1bmN0aW9uIChuZWlnaGJvdXIpIHtcbiAgICAgICAgaWYgKHJlbW92ZWROb2Rlcy5pbmRleE9mKG5laWdoYm91cikgPCAwKSB7XG4gICAgICAgICAgdmFyIG90aGVyRGVncmVlID0gcmVtYWluaW5nRGVncmVlcy5nZXQobmVpZ2hib3VyKTtcbiAgICAgICAgICB2YXIgbmV3RGVncmVlID0gb3RoZXJEZWdyZWUgLSAxO1xuXG4gICAgICAgICAgaWYgKG5ld0RlZ3JlZSA9PSAxKSB7XG4gICAgICAgICAgICB0ZW1wTGlzdC5wdXNoKG5laWdoYm91cik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVtYWluaW5nRGVncmVlcy5zZXQobmVpZ2hib3VyLCBuZXdEZWdyZWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZW1vdmVkTm9kZXMgPSByZW1vdmVkTm9kZXMuY29uY2F0KHRlbXBMaXN0KTtcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PSAxIHx8IGxpc3QubGVuZ3RoID09IDIpIHtcbiAgICAgIGZvdW5kQ2VudGVyID0gdHJ1ZTtcbiAgICAgIGNlbnRlck5vZGUgPSBsaXN0WzBdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjZW50ZXJOb2RlO1xufTtcblxuLyoqXHJcbiAqIER1cmluZyB0aGUgY29hcnNlbmluZyBwcm9jZXNzLCB0aGlzIGxheW91dCBtYXkgYmUgcmVmZXJlbmNlZCBieSB0d28gZ3JhcGggbWFuYWdlcnNcclxuICogdGhpcyBzZXR0ZXIgZnVuY3Rpb24gZ3JhbnRzIGFjY2VzcyB0byBjaGFuZ2UgdGhlIGN1cnJlbnRseSBiZWluZyB1c2VkIGdyYXBoIG1hbmFnZXJcclxuICovXG5MYXlvdXQucHJvdG90eXBlLnNldEdyYXBoTWFuYWdlciA9IGZ1bmN0aW9uIChnbSkge1xuICB0aGlzLmdyYXBoTWFuYWdlciA9IGdtO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMYXlvdXQ7XG5cbi8qKiovIH0pLFxuLyogMTYgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cblxuZnVuY3Rpb24gUmFuZG9tU2VlZCgpIHt9XG4vLyBhZGFwdGVkIGZyb206IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xOTMwMzcyNVxuUmFuZG9tU2VlZC5zZWVkID0gMTtcblJhbmRvbVNlZWQueCA9IDA7XG5cblJhbmRvbVNlZWQubmV4dERvdWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgUmFuZG9tU2VlZC54ID0gTWF0aC5zaW4oUmFuZG9tU2VlZC5zZWVkKyspICogMTAwMDA7XG4gIHJldHVybiBSYW5kb21TZWVkLnggLSBNYXRoLmZsb29yKFJhbmRvbVNlZWQueCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhbmRvbVNlZWQ7XG5cbi8qKiovIH0pLFxuLyogMTcgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cblxudmFyIFBvaW50RCA9IF9fd2VicGFja19yZXF1aXJlX18oNCk7XG5cbmZ1bmN0aW9uIFRyYW5zZm9ybSh4LCB5KSB7XG4gIHRoaXMubHdvcmxkT3JnWCA9IDAuMDtcbiAgdGhpcy5sd29ybGRPcmdZID0gMC4wO1xuICB0aGlzLmxkZXZpY2VPcmdYID0gMC4wO1xuICB0aGlzLmxkZXZpY2VPcmdZID0gMC4wO1xuICB0aGlzLmx3b3JsZEV4dFggPSAxLjA7XG4gIHRoaXMubHdvcmxkRXh0WSA9IDEuMDtcbiAgdGhpcy5sZGV2aWNlRXh0WCA9IDEuMDtcbiAgdGhpcy5sZGV2aWNlRXh0WSA9IDEuMDtcbn1cblxuVHJhbnNmb3JtLnByb3RvdHlwZS5nZXRXb3JsZE9yZ1ggPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmx3b3JsZE9yZ1g7XG59O1xuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLnNldFdvcmxkT3JnWCA9IGZ1bmN0aW9uICh3b3gpIHtcbiAgdGhpcy5sd29ybGRPcmdYID0gd294O1xufTtcblxuVHJhbnNmb3JtLnByb3RvdHlwZS5nZXRXb3JsZE9yZ1kgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmx3b3JsZE9yZ1k7XG59O1xuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLnNldFdvcmxkT3JnWSA9IGZ1bmN0aW9uICh3b3kpIHtcbiAgdGhpcy5sd29ybGRPcmdZID0gd295O1xufTtcblxuVHJhbnNmb3JtLnByb3RvdHlwZS5nZXRXb3JsZEV4dFggPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmx3b3JsZEV4dFg7XG59O1xuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLnNldFdvcmxkRXh0WCA9IGZ1bmN0aW9uICh3ZXgpIHtcbiAgdGhpcy5sd29ybGRFeHRYID0gd2V4O1xufTtcblxuVHJhbnNmb3JtLnByb3RvdHlwZS5nZXRXb3JsZEV4dFkgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmx3b3JsZEV4dFk7XG59O1xuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLnNldFdvcmxkRXh0WSA9IGZ1bmN0aW9uICh3ZXkpIHtcbiAgdGhpcy5sd29ybGRFeHRZID0gd2V5O1xufTtcblxuLyogRGV2aWNlIHJlbGF0ZWQgKi9cblxuVHJhbnNmb3JtLnByb3RvdHlwZS5nZXREZXZpY2VPcmdYID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5sZGV2aWNlT3JnWDtcbn07XG5cblRyYW5zZm9ybS5wcm90b3R5cGUuc2V0RGV2aWNlT3JnWCA9IGZ1bmN0aW9uIChkb3gpIHtcbiAgdGhpcy5sZGV2aWNlT3JnWCA9IGRveDtcbn07XG5cblRyYW5zZm9ybS5wcm90b3R5cGUuZ2V0RGV2aWNlT3JnWSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMubGRldmljZU9yZ1k7XG59O1xuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLnNldERldmljZU9yZ1kgPSBmdW5jdGlvbiAoZG95KSB7XG4gIHRoaXMubGRldmljZU9yZ1kgPSBkb3k7XG59O1xuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLmdldERldmljZUV4dFggPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmxkZXZpY2VFeHRYO1xufTtcblxuVHJhbnNmb3JtLnByb3RvdHlwZS5zZXREZXZpY2VFeHRYID0gZnVuY3Rpb24gKGRleCkge1xuICB0aGlzLmxkZXZpY2VFeHRYID0gZGV4O1xufTtcblxuVHJhbnNmb3JtLnByb3RvdHlwZS5nZXREZXZpY2VFeHRZID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5sZGV2aWNlRXh0WTtcbn07XG5cblRyYW5zZm9ybS5wcm90b3R5cGUuc2V0RGV2aWNlRXh0WSA9IGZ1bmN0aW9uIChkZXkpIHtcbiAgdGhpcy5sZGV2aWNlRXh0WSA9IGRleTtcbn07XG5cblRyYW5zZm9ybS5wcm90b3R5cGUudHJhbnNmb3JtWCA9IGZ1bmN0aW9uICh4KSB7XG4gIHZhciB4RGV2aWNlID0gMC4wO1xuICB2YXIgd29ybGRFeHRYID0gdGhpcy5sd29ybGRFeHRYO1xuICBpZiAod29ybGRFeHRYICE9IDAuMCkge1xuICAgIHhEZXZpY2UgPSB0aGlzLmxkZXZpY2VPcmdYICsgKHggLSB0aGlzLmx3b3JsZE9yZ1gpICogdGhpcy5sZGV2aWNlRXh0WCAvIHdvcmxkRXh0WDtcbiAgfVxuXG4gIHJldHVybiB4RGV2aWNlO1xufTtcblxuVHJhbnNmb3JtLnByb3RvdHlwZS50cmFuc2Zvcm1ZID0gZnVuY3Rpb24gKHkpIHtcbiAgdmFyIHlEZXZpY2UgPSAwLjA7XG4gIHZhciB3b3JsZEV4dFkgPSB0aGlzLmx3b3JsZEV4dFk7XG4gIGlmICh3b3JsZEV4dFkgIT0gMC4wKSB7XG4gICAgeURldmljZSA9IHRoaXMubGRldmljZU9yZ1kgKyAoeSAtIHRoaXMubHdvcmxkT3JnWSkgKiB0aGlzLmxkZXZpY2VFeHRZIC8gd29ybGRFeHRZO1xuICB9XG5cbiAgcmV0dXJuIHlEZXZpY2U7XG59O1xuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLmludmVyc2VUcmFuc2Zvcm1YID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIHhXb3JsZCA9IDAuMDtcbiAgdmFyIGRldmljZUV4dFggPSB0aGlzLmxkZXZpY2VFeHRYO1xuICBpZiAoZGV2aWNlRXh0WCAhPSAwLjApIHtcbiAgICB4V29ybGQgPSB0aGlzLmx3b3JsZE9yZ1ggKyAoeCAtIHRoaXMubGRldmljZU9yZ1gpICogdGhpcy5sd29ybGRFeHRYIC8gZGV2aWNlRXh0WDtcbiAgfVxuXG4gIHJldHVybiB4V29ybGQ7XG59O1xuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLmludmVyc2VUcmFuc2Zvcm1ZID0gZnVuY3Rpb24gKHkpIHtcbiAgdmFyIHlXb3JsZCA9IDAuMDtcbiAgdmFyIGRldmljZUV4dFkgPSB0aGlzLmxkZXZpY2VFeHRZO1xuICBpZiAoZGV2aWNlRXh0WSAhPSAwLjApIHtcbiAgICB5V29ybGQgPSB0aGlzLmx3b3JsZE9yZ1kgKyAoeSAtIHRoaXMubGRldmljZU9yZ1kpICogdGhpcy5sd29ybGRFeHRZIC8gZGV2aWNlRXh0WTtcbiAgfVxuICByZXR1cm4geVdvcmxkO1xufTtcblxuVHJhbnNmb3JtLnByb3RvdHlwZS5pbnZlcnNlVHJhbnNmb3JtUG9pbnQgPSBmdW5jdGlvbiAoaW5Qb2ludCkge1xuICB2YXIgb3V0UG9pbnQgPSBuZXcgUG9pbnREKHRoaXMuaW52ZXJzZVRyYW5zZm9ybVgoaW5Qb2ludC54KSwgdGhpcy5pbnZlcnNlVHJhbnNmb3JtWShpblBvaW50LnkpKTtcbiAgcmV0dXJuIG91dFBvaW50O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUcmFuc2Zvcm07XG5cbi8qKiovIH0pLFxuLyogMTggKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cblxuZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbnZhciBMYXlvdXQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDE1KTtcbnZhciBGRExheW91dENvbnN0YW50cyA9IF9fd2VicGFja19yZXF1aXJlX18oNyk7XG52YXIgTGF5b3V0Q29uc3RhbnRzID0gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcbnZhciBJR2VvbWV0cnkgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDgpO1xudmFyIElNYXRoID0gX193ZWJwYWNrX3JlcXVpcmVfXyg5KTtcblxuZnVuY3Rpb24gRkRMYXlvdXQoKSB7XG4gIExheW91dC5jYWxsKHRoaXMpO1xuXG4gIHRoaXMudXNlU21hcnRJZGVhbEVkZ2VMZW5ndGhDYWxjdWxhdGlvbiA9IEZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfVVNFX1NNQVJUX0lERUFMX0VER0VfTEVOR1RIX0NBTENVTEFUSU9OO1xuICB0aGlzLmlkZWFsRWRnZUxlbmd0aCA9IEZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfRURHRV9MRU5HVEg7XG4gIHRoaXMuc3ByaW5nQ29uc3RhbnQgPSBGRExheW91dENvbnN0YW50cy5ERUZBVUxUX1NQUklOR19TVFJFTkdUSDtcbiAgdGhpcy5yZXB1bHNpb25Db25zdGFudCA9IEZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfUkVQVUxTSU9OX1NUUkVOR1RIO1xuICB0aGlzLmdyYXZpdHlDb25zdGFudCA9IEZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfR1JBVklUWV9TVFJFTkdUSDtcbiAgdGhpcy5jb21wb3VuZEdyYXZpdHlDb25zdGFudCA9IEZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfQ09NUE9VTkRfR1JBVklUWV9TVFJFTkdUSDtcbiAgdGhpcy5ncmF2aXR5UmFuZ2VGYWN0b3IgPSBGRExheW91dENvbnN0YW50cy5ERUZBVUxUX0dSQVZJVFlfUkFOR0VfRkFDVE9SO1xuICB0aGlzLmNvbXBvdW5kR3Jhdml0eVJhbmdlRmFjdG9yID0gRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9DT01QT1VORF9HUkFWSVRZX1JBTkdFX0ZBQ1RPUjtcbiAgdGhpcy5kaXNwbGFjZW1lbnRUaHJlc2hvbGRQZXJOb2RlID0gMy4wICogRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9FREdFX0xFTkdUSCAvIDEwMDtcbiAgdGhpcy5jb29saW5nRmFjdG9yID0gRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9DT09MSU5HX0ZBQ1RPUl9JTkNSRU1FTlRBTDtcbiAgdGhpcy5pbml0aWFsQ29vbGluZ0ZhY3RvciA9IEZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfQ09PTElOR19GQUNUT1JfSU5DUkVNRU5UQUw7XG4gIHRoaXMudG90YWxEaXNwbGFjZW1lbnQgPSAwLjA7XG4gIHRoaXMub2xkVG90YWxEaXNwbGFjZW1lbnQgPSAwLjA7XG4gIHRoaXMubWF4SXRlcmF0aW9ucyA9IEZETGF5b3V0Q29uc3RhbnRzLk1BWF9JVEVSQVRJT05TO1xufVxuXG5GRExheW91dC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKExheW91dC5wcm90b3R5cGUpO1xuXG5mb3IgKHZhciBwcm9wIGluIExheW91dCkge1xuICBGRExheW91dFtwcm9wXSA9IExheW91dFtwcm9wXTtcbn1cblxuRkRMYXlvdXQucHJvdG90eXBlLmluaXRQYXJhbWV0ZXJzID0gZnVuY3Rpb24gKCkge1xuICBMYXlvdXQucHJvdG90eXBlLmluaXRQYXJhbWV0ZXJzLmNhbGwodGhpcywgYXJndW1lbnRzKTtcblxuICB0aGlzLnRvdGFsSXRlcmF0aW9ucyA9IDA7XG4gIHRoaXMubm90QW5pbWF0ZWRJdGVyYXRpb25zID0gMDtcblxuICB0aGlzLnVzZUZSR3JpZFZhcmlhbnQgPSBGRExheW91dENvbnN0YW50cy5ERUZBVUxUX1VTRV9TTUFSVF9SRVBVTFNJT05fUkFOR0VfQ0FMQ1VMQVRJT047XG5cbiAgdGhpcy5ncmlkID0gW107XG59O1xuXG5GRExheW91dC5wcm90b3R5cGUuY2FsY0lkZWFsRWRnZUxlbmd0aHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBlZGdlO1xuICB2YXIgbGNhRGVwdGg7XG4gIHZhciBzb3VyY2U7XG4gIHZhciB0YXJnZXQ7XG4gIHZhciBzaXplT2ZTb3VyY2VJbkxjYTtcbiAgdmFyIHNpemVPZlRhcmdldEluTGNhO1xuXG4gIHZhciBhbGxFZGdlcyA9IHRoaXMuZ2V0R3JhcGhNYW5hZ2VyKCkuZ2V0QWxsRWRnZXMoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbGxFZGdlcy5sZW5ndGg7IGkrKykge1xuICAgIGVkZ2UgPSBhbGxFZGdlc1tpXTtcblxuICAgIGVkZ2UuaWRlYWxMZW5ndGggPSB0aGlzLmlkZWFsRWRnZUxlbmd0aDtcblxuICAgIGlmIChlZGdlLmlzSW50ZXJHcmFwaCkge1xuICAgICAgc291cmNlID0gZWRnZS5nZXRTb3VyY2UoKTtcbiAgICAgIHRhcmdldCA9IGVkZ2UuZ2V0VGFyZ2V0KCk7XG5cbiAgICAgIHNpemVPZlNvdXJjZUluTGNhID0gZWRnZS5nZXRTb3VyY2VJbkxjYSgpLmdldEVzdGltYXRlZFNpemUoKTtcbiAgICAgIHNpemVPZlRhcmdldEluTGNhID0gZWRnZS5nZXRUYXJnZXRJbkxjYSgpLmdldEVzdGltYXRlZFNpemUoKTtcblxuICAgICAgaWYgKHRoaXMudXNlU21hcnRJZGVhbEVkZ2VMZW5ndGhDYWxjdWxhdGlvbikge1xuICAgICAgICBlZGdlLmlkZWFsTGVuZ3RoICs9IHNpemVPZlNvdXJjZUluTGNhICsgc2l6ZU9mVGFyZ2V0SW5MY2EgLSAyICogTGF5b3V0Q29uc3RhbnRzLlNJTVBMRV9OT0RFX1NJWkU7XG4gICAgICB9XG5cbiAgICAgIGxjYURlcHRoID0gZWRnZS5nZXRMY2EoKS5nZXRJbmNsdXNpb25UcmVlRGVwdGgoKTtcblxuICAgICAgZWRnZS5pZGVhbExlbmd0aCArPSBGRExheW91dENvbnN0YW50cy5ERUZBVUxUX0VER0VfTEVOR1RIICogRkRMYXlvdXRDb25zdGFudHMuUEVSX0xFVkVMX0lERUFMX0VER0VfTEVOR1RIX0ZBQ1RPUiAqIChzb3VyY2UuZ2V0SW5jbHVzaW9uVHJlZURlcHRoKCkgKyB0YXJnZXQuZ2V0SW5jbHVzaW9uVHJlZURlcHRoKCkgLSAyICogbGNhRGVwdGgpO1xuICAgIH1cbiAgfVxufTtcblxuRkRMYXlvdXQucHJvdG90eXBlLmluaXRTcHJpbmdFbWJlZGRlciA9IGZ1bmN0aW9uICgpIHtcblxuICB2YXIgcyA9IHRoaXMuZ2V0QWxsTm9kZXMoKS5sZW5ndGg7XG4gIGlmICh0aGlzLmluY3JlbWVudGFsKSB7XG4gICAgaWYgKHMgPiBGRExheW91dENvbnN0YW50cy5BREFQVEFUSU9OX0xPV0VSX05PREVfTElNSVQpIHtcbiAgICAgIHRoaXMuY29vbGluZ0ZhY3RvciA9IE1hdGgubWF4KHRoaXMuY29vbGluZ0ZhY3RvciAqIEZETGF5b3V0Q29uc3RhbnRzLkNPT0xJTkdfQURBUFRBVElPTl9GQUNUT1IsIHRoaXMuY29vbGluZ0ZhY3RvciAtIChzIC0gRkRMYXlvdXRDb25zdGFudHMuQURBUFRBVElPTl9MT1dFUl9OT0RFX0xJTUlUKSAvIChGRExheW91dENvbnN0YW50cy5BREFQVEFUSU9OX1VQUEVSX05PREVfTElNSVQgLSBGRExheW91dENvbnN0YW50cy5BREFQVEFUSU9OX0xPV0VSX05PREVfTElNSVQpICogdGhpcy5jb29saW5nRmFjdG9yICogKDEgLSBGRExheW91dENvbnN0YW50cy5DT09MSU5HX0FEQVBUQVRJT05fRkFDVE9SKSk7XG4gICAgfVxuICAgIHRoaXMubWF4Tm9kZURpc3BsYWNlbWVudCA9IEZETGF5b3V0Q29uc3RhbnRzLk1BWF9OT0RFX0RJU1BMQUNFTUVOVF9JTkNSRU1FTlRBTDtcbiAgfSBlbHNlIHtcbiAgICBpZiAocyA+IEZETGF5b3V0Q29uc3RhbnRzLkFEQVBUQVRJT05fTE9XRVJfTk9ERV9MSU1JVCkge1xuICAgICAgdGhpcy5jb29saW5nRmFjdG9yID0gTWF0aC5tYXgoRkRMYXlvdXRDb25zdGFudHMuQ09PTElOR19BREFQVEFUSU9OX0ZBQ1RPUiwgMS4wIC0gKHMgLSBGRExheW91dENvbnN0YW50cy5BREFQVEFUSU9OX0xPV0VSX05PREVfTElNSVQpIC8gKEZETGF5b3V0Q29uc3RhbnRzLkFEQVBUQVRJT05fVVBQRVJfTk9ERV9MSU1JVCAtIEZETGF5b3V0Q29uc3RhbnRzLkFEQVBUQVRJT05fTE9XRVJfTk9ERV9MSU1JVCkgKiAoMSAtIEZETGF5b3V0Q29uc3RhbnRzLkNPT0xJTkdfQURBUFRBVElPTl9GQUNUT1IpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jb29saW5nRmFjdG9yID0gMS4wO1xuICAgIH1cbiAgICB0aGlzLmluaXRpYWxDb29saW5nRmFjdG9yID0gdGhpcy5jb29saW5nRmFjdG9yO1xuICAgIHRoaXMubWF4Tm9kZURpc3BsYWNlbWVudCA9IEZETGF5b3V0Q29uc3RhbnRzLk1BWF9OT0RFX0RJU1BMQUNFTUVOVDtcbiAgfVxuXG4gIHRoaXMubWF4SXRlcmF0aW9ucyA9IE1hdGgubWF4KHRoaXMuZ2V0QWxsTm9kZXMoKS5sZW5ndGggKiA1LCB0aGlzLm1heEl0ZXJhdGlvbnMpO1xuXG4gIHRoaXMudG90YWxEaXNwbGFjZW1lbnRUaHJlc2hvbGQgPSB0aGlzLmRpc3BsYWNlbWVudFRocmVzaG9sZFBlck5vZGUgKiB0aGlzLmdldEFsbE5vZGVzKCkubGVuZ3RoO1xuXG4gIHRoaXMucmVwdWxzaW9uUmFuZ2UgPSB0aGlzLmNhbGNSZXB1bHNpb25SYW5nZSgpO1xufTtcblxuRkRMYXlvdXQucHJvdG90eXBlLmNhbGNTcHJpbmdGb3JjZXMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBsRWRnZXMgPSB0aGlzLmdldEFsbEVkZ2VzKCk7XG4gIHZhciBlZGdlO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbEVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgZWRnZSA9IGxFZGdlc1tpXTtcblxuICAgIHRoaXMuY2FsY1NwcmluZ0ZvcmNlKGVkZ2UsIGVkZ2UuaWRlYWxMZW5ndGgpO1xuICB9XG59O1xuXG5GRExheW91dC5wcm90b3R5cGUuY2FsY1JlcHVsc2lvbkZvcmNlcyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGdyaWRVcGRhdGVBbGxvd2VkID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB0cnVlO1xuICB2YXIgZm9yY2VUb05vZGVTdXJyb3VuZGluZ1VwZGF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogZmFsc2U7XG5cbiAgdmFyIGksIGo7XG4gIHZhciBub2RlQSwgbm9kZUI7XG4gIHZhciBsTm9kZXMgPSB0aGlzLmdldEFsbE5vZGVzKCk7XG4gIHZhciBwcm9jZXNzZWROb2RlU2V0O1xuXG4gIGlmICh0aGlzLnVzZUZSR3JpZFZhcmlhbnQpIHtcbiAgICBpZiAodGhpcy50b3RhbEl0ZXJhdGlvbnMgJSBGRExheW91dENvbnN0YW50cy5HUklEX0NBTENVTEFUSU9OX0NIRUNLX1BFUklPRCA9PSAxICYmIGdyaWRVcGRhdGVBbGxvd2VkKSB7XG4gICAgICB0aGlzLnVwZGF0ZUdyaWQoKTtcbiAgICB9XG5cbiAgICBwcm9jZXNzZWROb2RlU2V0ID0gbmV3IFNldCgpO1xuXG4gICAgLy8gY2FsY3VsYXRlIHJlcHVsc2lvbiBmb3JjZXMgYmV0d2VlbiBlYWNoIG5vZGVzIGFuZCBpdHMgc3Vycm91bmRpbmdcbiAgICBmb3IgKGkgPSAwOyBpIDwgbE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBub2RlQSA9IGxOb2Rlc1tpXTtcbiAgICAgIHRoaXMuY2FsY3VsYXRlUmVwdWxzaW9uRm9yY2VPZkFOb2RlKG5vZGVBLCBwcm9jZXNzZWROb2RlU2V0LCBncmlkVXBkYXRlQWxsb3dlZCwgZm9yY2VUb05vZGVTdXJyb3VuZGluZ1VwZGF0ZSk7XG4gICAgICBwcm9jZXNzZWROb2RlU2V0LmFkZChub2RlQSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGZvciAoaSA9IDA7IGkgPCBsTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG5vZGVBID0gbE5vZGVzW2ldO1xuXG4gICAgICBmb3IgKGogPSBpICsgMTsgaiA8IGxOb2Rlcy5sZW5ndGg7IGorKykge1xuICAgICAgICBub2RlQiA9IGxOb2Rlc1tqXTtcblxuICAgICAgICAvLyBJZiBib3RoIG5vZGVzIGFyZSBub3QgbWVtYmVycyBvZiB0aGUgc2FtZSBncmFwaCwgc2tpcC5cbiAgICAgICAgaWYgKG5vZGVBLmdldE93bmVyKCkgIT0gbm9kZUIuZ2V0T3duZXIoKSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jYWxjUmVwdWxzaW9uRm9yY2Uobm9kZUEsIG5vZGVCKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbkZETGF5b3V0LnByb3RvdHlwZS5jYWxjR3Jhdml0YXRpb25hbEZvcmNlcyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG5vZGU7XG4gIHZhciBsTm9kZXMgPSB0aGlzLmdldEFsbE5vZGVzVG9BcHBseUdyYXZpdGF0aW9uKCk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICBub2RlID0gbE5vZGVzW2ldO1xuICAgIHRoaXMuY2FsY0dyYXZpdGF0aW9uYWxGb3JjZShub2RlKTtcbiAgfVxufTtcblxuRkRMYXlvdXQucHJvdG90eXBlLm1vdmVOb2RlcyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGxOb2RlcyA9IHRoaXMuZ2V0QWxsTm9kZXMoKTtcbiAgdmFyIG5vZGU7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICBub2RlID0gbE5vZGVzW2ldO1xuICAgIG5vZGUubW92ZSgpO1xuICB9XG59O1xuXG5GRExheW91dC5wcm90b3R5cGUuY2FsY1NwcmluZ0ZvcmNlID0gZnVuY3Rpb24gKGVkZ2UsIGlkZWFsTGVuZ3RoKSB7XG4gIHZhciBzb3VyY2VOb2RlID0gZWRnZS5nZXRTb3VyY2UoKTtcbiAgdmFyIHRhcmdldE5vZGUgPSBlZGdlLmdldFRhcmdldCgpO1xuXG4gIHZhciBsZW5ndGg7XG4gIHZhciBzcHJpbmdGb3JjZTtcbiAgdmFyIHNwcmluZ0ZvcmNlWDtcbiAgdmFyIHNwcmluZ0ZvcmNlWTtcblxuICAvLyBVcGRhdGUgZWRnZSBsZW5ndGhcbiAgaWYgKHRoaXMudW5pZm9ybUxlYWZOb2RlU2l6ZXMgJiYgc291cmNlTm9kZS5nZXRDaGlsZCgpID09IG51bGwgJiYgdGFyZ2V0Tm9kZS5nZXRDaGlsZCgpID09IG51bGwpIHtcbiAgICBlZGdlLnVwZGF0ZUxlbmd0aFNpbXBsZSgpO1xuICB9IGVsc2Uge1xuICAgIGVkZ2UudXBkYXRlTGVuZ3RoKCk7XG5cbiAgICBpZiAoZWRnZS5pc092ZXJsYXBpbmdTb3VyY2VBbmRUYXJnZXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBsZW5ndGggPSBlZGdlLmdldExlbmd0aCgpO1xuXG4gIGlmIChsZW5ndGggPT0gMCkgcmV0dXJuO1xuXG4gIC8vIENhbGN1bGF0ZSBzcHJpbmcgZm9yY2VzXG4gIHNwcmluZ0ZvcmNlID0gdGhpcy5zcHJpbmdDb25zdGFudCAqIChsZW5ndGggLSBpZGVhbExlbmd0aCk7XG5cbiAgLy8gUHJvamVjdCBmb3JjZSBvbnRvIHggYW5kIHkgYXhlc1xuICBzcHJpbmdGb3JjZVggPSBzcHJpbmdGb3JjZSAqIChlZGdlLmxlbmd0aFggLyBsZW5ndGgpO1xuICBzcHJpbmdGb3JjZVkgPSBzcHJpbmdGb3JjZSAqIChlZGdlLmxlbmd0aFkgLyBsZW5ndGgpO1xuXG4gIC8vIEFwcGx5IGZvcmNlcyBvbiB0aGUgZW5kIG5vZGVzXG4gIHNvdXJjZU5vZGUuc3ByaW5nRm9yY2VYICs9IHNwcmluZ0ZvcmNlWDtcbiAgc291cmNlTm9kZS5zcHJpbmdGb3JjZVkgKz0gc3ByaW5nRm9yY2VZO1xuICB0YXJnZXROb2RlLnNwcmluZ0ZvcmNlWCAtPSBzcHJpbmdGb3JjZVg7XG4gIHRhcmdldE5vZGUuc3ByaW5nRm9yY2VZIC09IHNwcmluZ0ZvcmNlWTtcbn07XG5cbkZETGF5b3V0LnByb3RvdHlwZS5jYWxjUmVwdWxzaW9uRm9yY2UgPSBmdW5jdGlvbiAobm9kZUEsIG5vZGVCKSB7XG4gIHZhciByZWN0QSA9IG5vZGVBLmdldFJlY3QoKTtcbiAgdmFyIHJlY3RCID0gbm9kZUIuZ2V0UmVjdCgpO1xuICB2YXIgb3ZlcmxhcEFtb3VudCA9IG5ldyBBcnJheSgyKTtcbiAgdmFyIGNsaXBQb2ludHMgPSBuZXcgQXJyYXkoNCk7XG4gIHZhciBkaXN0YW5jZVg7XG4gIHZhciBkaXN0YW5jZVk7XG4gIHZhciBkaXN0YW5jZVNxdWFyZWQ7XG4gIHZhciBkaXN0YW5jZTtcbiAgdmFyIHJlcHVsc2lvbkZvcmNlO1xuICB2YXIgcmVwdWxzaW9uRm9yY2VYO1xuICB2YXIgcmVwdWxzaW9uRm9yY2VZO1xuXG4gIGlmIChyZWN0QS5pbnRlcnNlY3RzKHJlY3RCKSkgLy8gdHdvIG5vZGVzIG92ZXJsYXBcbiAgICB7XG4gICAgICAvLyBjYWxjdWxhdGUgc2VwYXJhdGlvbiBhbW91bnQgaW4geCBhbmQgeSBkaXJlY3Rpb25zXG4gICAgICBJR2VvbWV0cnkuY2FsY1NlcGFyYXRpb25BbW91bnQocmVjdEEsIHJlY3RCLCBvdmVybGFwQW1vdW50LCBGRExheW91dENvbnN0YW50cy5ERUZBVUxUX0VER0VfTEVOR1RIIC8gMi4wKTtcblxuICAgICAgcmVwdWxzaW9uRm9yY2VYID0gMiAqIG92ZXJsYXBBbW91bnRbMF07XG4gICAgICByZXB1bHNpb25Gb3JjZVkgPSAyICogb3ZlcmxhcEFtb3VudFsxXTtcblxuICAgICAgdmFyIGNoaWxkcmVuQ29uc3RhbnQgPSBub2RlQS5ub09mQ2hpbGRyZW4gKiBub2RlQi5ub09mQ2hpbGRyZW4gLyAobm9kZUEubm9PZkNoaWxkcmVuICsgbm9kZUIubm9PZkNoaWxkcmVuKTtcblxuICAgICAgLy8gQXBwbHkgZm9yY2VzIG9uIHRoZSB0d28gbm9kZXNcbiAgICAgIG5vZGVBLnJlcHVsc2lvbkZvcmNlWCAtPSBjaGlsZHJlbkNvbnN0YW50ICogcmVwdWxzaW9uRm9yY2VYO1xuICAgICAgbm9kZUEucmVwdWxzaW9uRm9yY2VZIC09IGNoaWxkcmVuQ29uc3RhbnQgKiByZXB1bHNpb25Gb3JjZVk7XG4gICAgICBub2RlQi5yZXB1bHNpb25Gb3JjZVggKz0gY2hpbGRyZW5Db25zdGFudCAqIHJlcHVsc2lvbkZvcmNlWDtcbiAgICAgIG5vZGVCLnJlcHVsc2lvbkZvcmNlWSArPSBjaGlsZHJlbkNvbnN0YW50ICogcmVwdWxzaW9uRm9yY2VZO1xuICAgIH0gZWxzZSAvLyBubyBvdmVybGFwXG4gICAge1xuICAgICAgLy8gY2FsY3VsYXRlIGRpc3RhbmNlXG5cbiAgICAgIGlmICh0aGlzLnVuaWZvcm1MZWFmTm9kZVNpemVzICYmIG5vZGVBLmdldENoaWxkKCkgPT0gbnVsbCAmJiBub2RlQi5nZXRDaGlsZCgpID09IG51bGwpIC8vIHNpbXBseSBiYXNlIHJlcHVsc2lvbiBvbiBkaXN0YW5jZSBvZiBub2RlIGNlbnRlcnNcbiAgICAgICAge1xuICAgICAgICAgIGRpc3RhbmNlWCA9IHJlY3RCLmdldENlbnRlclgoKSAtIHJlY3RBLmdldENlbnRlclgoKTtcbiAgICAgICAgICBkaXN0YW5jZVkgPSByZWN0Qi5nZXRDZW50ZXJZKCkgLSByZWN0QS5nZXRDZW50ZXJZKCk7XG4gICAgICAgIH0gZWxzZSAvLyB1c2UgY2xpcHBpbmcgcG9pbnRzXG4gICAgICAgIHtcbiAgICAgICAgICBJR2VvbWV0cnkuZ2V0SW50ZXJzZWN0aW9uKHJlY3RBLCByZWN0QiwgY2xpcFBvaW50cyk7XG5cbiAgICAgICAgICBkaXN0YW5jZVggPSBjbGlwUG9pbnRzWzJdIC0gY2xpcFBvaW50c1swXTtcbiAgICAgICAgICBkaXN0YW5jZVkgPSBjbGlwUG9pbnRzWzNdIC0gY2xpcFBvaW50c1sxXTtcbiAgICAgICAgfVxuXG4gICAgICAvLyBObyByZXB1bHNpb24gcmFuZ2UuIEZSIGdyaWQgdmFyaWFudCBzaG91bGQgdGFrZSBjYXJlIG9mIHRoaXMuXG4gICAgICBpZiAoTWF0aC5hYnMoZGlzdGFuY2VYKSA8IEZETGF5b3V0Q29uc3RhbnRzLk1JTl9SRVBVTFNJT05fRElTVCkge1xuICAgICAgICBkaXN0YW5jZVggPSBJTWF0aC5zaWduKGRpc3RhbmNlWCkgKiBGRExheW91dENvbnN0YW50cy5NSU5fUkVQVUxTSU9OX0RJU1Q7XG4gICAgICB9XG5cbiAgICAgIGlmIChNYXRoLmFicyhkaXN0YW5jZVkpIDwgRkRMYXlvdXRDb25zdGFudHMuTUlOX1JFUFVMU0lPTl9ESVNUKSB7XG4gICAgICAgIGRpc3RhbmNlWSA9IElNYXRoLnNpZ24oZGlzdGFuY2VZKSAqIEZETGF5b3V0Q29uc3RhbnRzLk1JTl9SRVBVTFNJT05fRElTVDtcbiAgICAgIH1cblxuICAgICAgZGlzdGFuY2VTcXVhcmVkID0gZGlzdGFuY2VYICogZGlzdGFuY2VYICsgZGlzdGFuY2VZICogZGlzdGFuY2VZO1xuICAgICAgZGlzdGFuY2UgPSBNYXRoLnNxcnQoZGlzdGFuY2VTcXVhcmVkKTtcblxuICAgICAgcmVwdWxzaW9uRm9yY2UgPSB0aGlzLnJlcHVsc2lvbkNvbnN0YW50ICogbm9kZUEubm9PZkNoaWxkcmVuICogbm9kZUIubm9PZkNoaWxkcmVuIC8gZGlzdGFuY2VTcXVhcmVkO1xuXG4gICAgICAvLyBQcm9qZWN0IGZvcmNlIG9udG8geCBhbmQgeSBheGVzXG4gICAgICByZXB1bHNpb25Gb3JjZVggPSByZXB1bHNpb25Gb3JjZSAqIGRpc3RhbmNlWCAvIGRpc3RhbmNlO1xuICAgICAgcmVwdWxzaW9uRm9yY2VZID0gcmVwdWxzaW9uRm9yY2UgKiBkaXN0YW5jZVkgLyBkaXN0YW5jZTtcblxuICAgICAgLy8gQXBwbHkgZm9yY2VzIG9uIHRoZSB0d28gbm9kZXMgICAgXG4gICAgICBub2RlQS5yZXB1bHNpb25Gb3JjZVggLT0gcmVwdWxzaW9uRm9yY2VYO1xuICAgICAgbm9kZUEucmVwdWxzaW9uRm9yY2VZIC09IHJlcHVsc2lvbkZvcmNlWTtcbiAgICAgIG5vZGVCLnJlcHVsc2lvbkZvcmNlWCArPSByZXB1bHNpb25Gb3JjZVg7XG4gICAgICBub2RlQi5yZXB1bHNpb25Gb3JjZVkgKz0gcmVwdWxzaW9uRm9yY2VZO1xuICAgIH1cbn07XG5cbkZETGF5b3V0LnByb3RvdHlwZS5jYWxjR3Jhdml0YXRpb25hbEZvcmNlID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgdmFyIG93bmVyR3JhcGg7XG4gIHZhciBvd25lckNlbnRlclg7XG4gIHZhciBvd25lckNlbnRlclk7XG4gIHZhciBkaXN0YW5jZVg7XG4gIHZhciBkaXN0YW5jZVk7XG4gIHZhciBhYnNEaXN0YW5jZVg7XG4gIHZhciBhYnNEaXN0YW5jZVk7XG4gIHZhciBlc3RpbWF0ZWRTaXplO1xuICBvd25lckdyYXBoID0gbm9kZS5nZXRPd25lcigpO1xuXG4gIG93bmVyQ2VudGVyWCA9IChvd25lckdyYXBoLmdldFJpZ2h0KCkgKyBvd25lckdyYXBoLmdldExlZnQoKSkgLyAyO1xuICBvd25lckNlbnRlclkgPSAob3duZXJHcmFwaC5nZXRUb3AoKSArIG93bmVyR3JhcGguZ2V0Qm90dG9tKCkpIC8gMjtcbiAgZGlzdGFuY2VYID0gbm9kZS5nZXRDZW50ZXJYKCkgLSBvd25lckNlbnRlclg7XG4gIGRpc3RhbmNlWSA9IG5vZGUuZ2V0Q2VudGVyWSgpIC0gb3duZXJDZW50ZXJZO1xuICBhYnNEaXN0YW5jZVggPSBNYXRoLmFicyhkaXN0YW5jZVgpICsgbm9kZS5nZXRXaWR0aCgpIC8gMjtcbiAgYWJzRGlzdGFuY2VZID0gTWF0aC5hYnMoZGlzdGFuY2VZKSArIG5vZGUuZ2V0SGVpZ2h0KCkgLyAyO1xuXG4gIGlmIChub2RlLmdldE93bmVyKCkgPT0gdGhpcy5ncmFwaE1hbmFnZXIuZ2V0Um9vdCgpKSAvLyBpbiB0aGUgcm9vdCBncmFwaFxuICAgIHtcbiAgICAgIGVzdGltYXRlZFNpemUgPSBvd25lckdyYXBoLmdldEVzdGltYXRlZFNpemUoKSAqIHRoaXMuZ3Jhdml0eVJhbmdlRmFjdG9yO1xuXG4gICAgICBpZiAoYWJzRGlzdGFuY2VYID4gZXN0aW1hdGVkU2l6ZSB8fCBhYnNEaXN0YW5jZVkgPiBlc3RpbWF0ZWRTaXplKSB7XG4gICAgICAgIG5vZGUuZ3Jhdml0YXRpb25Gb3JjZVggPSAtdGhpcy5ncmF2aXR5Q29uc3RhbnQgKiBkaXN0YW5jZVg7XG4gICAgICAgIG5vZGUuZ3Jhdml0YXRpb25Gb3JjZVkgPSAtdGhpcy5ncmF2aXR5Q29uc3RhbnQgKiBkaXN0YW5jZVk7XG4gICAgICB9XG4gICAgfSBlbHNlIC8vIGluc2lkZSBhIGNvbXBvdW5kXG4gICAge1xuICAgICAgZXN0aW1hdGVkU2l6ZSA9IG93bmVyR3JhcGguZ2V0RXN0aW1hdGVkU2l6ZSgpICogdGhpcy5jb21wb3VuZEdyYXZpdHlSYW5nZUZhY3RvcjtcblxuICAgICAgaWYgKGFic0Rpc3RhbmNlWCA+IGVzdGltYXRlZFNpemUgfHwgYWJzRGlzdGFuY2VZID4gZXN0aW1hdGVkU2l6ZSkge1xuICAgICAgICBub2RlLmdyYXZpdGF0aW9uRm9yY2VYID0gLXRoaXMuZ3Jhdml0eUNvbnN0YW50ICogZGlzdGFuY2VYICogdGhpcy5jb21wb3VuZEdyYXZpdHlDb25zdGFudDtcbiAgICAgICAgbm9kZS5ncmF2aXRhdGlvbkZvcmNlWSA9IC10aGlzLmdyYXZpdHlDb25zdGFudCAqIGRpc3RhbmNlWSAqIHRoaXMuY29tcG91bmRHcmF2aXR5Q29uc3RhbnQ7XG4gICAgICB9XG4gICAgfVxufTtcblxuRkRMYXlvdXQucHJvdG90eXBlLmlzQ29udmVyZ2VkID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY29udmVyZ2VkO1xuICB2YXIgb3NjaWxhdGluZyA9IGZhbHNlO1xuXG4gIGlmICh0aGlzLnRvdGFsSXRlcmF0aW9ucyA+IHRoaXMubWF4SXRlcmF0aW9ucyAvIDMpIHtcbiAgICBvc2NpbGF0aW5nID0gTWF0aC5hYnModGhpcy50b3RhbERpc3BsYWNlbWVudCAtIHRoaXMub2xkVG90YWxEaXNwbGFjZW1lbnQpIDwgMjtcbiAgfVxuXG4gIGNvbnZlcmdlZCA9IHRoaXMudG90YWxEaXNwbGFjZW1lbnQgPCB0aGlzLnRvdGFsRGlzcGxhY2VtZW50VGhyZXNob2xkO1xuXG4gIHRoaXMub2xkVG90YWxEaXNwbGFjZW1lbnQgPSB0aGlzLnRvdGFsRGlzcGxhY2VtZW50O1xuXG4gIHJldHVybiBjb252ZXJnZWQgfHwgb3NjaWxhdGluZztcbn07XG5cbkZETGF5b3V0LnByb3RvdHlwZS5hbmltYXRlID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5hbmltYXRpb25EdXJpbmdMYXlvdXQgJiYgIXRoaXMuaXNTdWJMYXlvdXQpIHtcbiAgICBpZiAodGhpcy5ub3RBbmltYXRlZEl0ZXJhdGlvbnMgPT0gdGhpcy5hbmltYXRpb25QZXJpb2QpIHtcbiAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICB0aGlzLm5vdEFuaW1hdGVkSXRlcmF0aW9ucyA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubm90QW5pbWF0ZWRJdGVyYXRpb25zKys7XG4gICAgfVxuICB9XG59O1xuXG4vL1RoaXMgbWV0aG9kIGNhbGN1bGF0ZXMgdGhlIG51bWJlciBvZiBjaGlsZHJlbiAod2VpZ2h0KSBmb3IgYWxsIG5vZGVzXG5GRExheW91dC5wcm90b3R5cGUuY2FsY05vT2ZDaGlsZHJlbkZvckFsbE5vZGVzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbm9kZTtcbiAgdmFyIGFsbE5vZGVzID0gdGhpcy5ncmFwaE1hbmFnZXIuZ2V0QWxsTm9kZXMoKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFsbE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgbm9kZSA9IGFsbE5vZGVzW2ldO1xuICAgIG5vZGUubm9PZkNoaWxkcmVuID0gbm9kZS5nZXROb09mQ2hpbGRyZW4oKTtcbiAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFNlY3Rpb246IEZSLUdyaWQgVmFyaWFudCBSZXB1bHNpb24gRm9yY2UgQ2FsY3VsYXRpb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbkZETGF5b3V0LnByb3RvdHlwZS5jYWxjR3JpZCA9IGZ1bmN0aW9uIChncmFwaCkge1xuXG4gIHZhciBzaXplWCA9IDA7XG4gIHZhciBzaXplWSA9IDA7XG5cbiAgc2l6ZVggPSBwYXJzZUludChNYXRoLmNlaWwoKGdyYXBoLmdldFJpZ2h0KCkgLSBncmFwaC5nZXRMZWZ0KCkpIC8gdGhpcy5yZXB1bHNpb25SYW5nZSkpO1xuICBzaXplWSA9IHBhcnNlSW50KE1hdGguY2VpbCgoZ3JhcGguZ2V0Qm90dG9tKCkgLSBncmFwaC5nZXRUb3AoKSkgLyB0aGlzLnJlcHVsc2lvblJhbmdlKSk7XG5cbiAgdmFyIGdyaWQgPSBuZXcgQXJyYXkoc2l6ZVgpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc2l6ZVg7IGkrKykge1xuICAgIGdyaWRbaV0gPSBuZXcgQXJyYXkoc2l6ZVkpO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaXplWDsgaSsrKSB7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBzaXplWTsgaisrKSB7XG4gICAgICBncmlkW2ldW2pdID0gbmV3IEFycmF5KCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGdyaWQ7XG59O1xuXG5GRExheW91dC5wcm90b3R5cGUuYWRkTm9kZVRvR3JpZCA9IGZ1bmN0aW9uICh2LCBsZWZ0LCB0b3ApIHtcblxuICB2YXIgc3RhcnRYID0gMDtcbiAgdmFyIGZpbmlzaFggPSAwO1xuICB2YXIgc3RhcnRZID0gMDtcbiAgdmFyIGZpbmlzaFkgPSAwO1xuXG4gIHN0YXJ0WCA9IHBhcnNlSW50KE1hdGguZmxvb3IoKHYuZ2V0UmVjdCgpLnggLSBsZWZ0KSAvIHRoaXMucmVwdWxzaW9uUmFuZ2UpKTtcbiAgZmluaXNoWCA9IHBhcnNlSW50KE1hdGguZmxvb3IoKHYuZ2V0UmVjdCgpLndpZHRoICsgdi5nZXRSZWN0KCkueCAtIGxlZnQpIC8gdGhpcy5yZXB1bHNpb25SYW5nZSkpO1xuICBzdGFydFkgPSBwYXJzZUludChNYXRoLmZsb29yKCh2LmdldFJlY3QoKS55IC0gdG9wKSAvIHRoaXMucmVwdWxzaW9uUmFuZ2UpKTtcbiAgZmluaXNoWSA9IHBhcnNlSW50KE1hdGguZmxvb3IoKHYuZ2V0UmVjdCgpLmhlaWdodCArIHYuZ2V0UmVjdCgpLnkgLSB0b3ApIC8gdGhpcy5yZXB1bHNpb25SYW5nZSkpO1xuXG4gIGZvciAodmFyIGkgPSBzdGFydFg7IGkgPD0gZmluaXNoWDsgaSsrKSB7XG4gICAgZm9yICh2YXIgaiA9IHN0YXJ0WTsgaiA8PSBmaW5pc2hZOyBqKyspIHtcbiAgICAgIHRoaXMuZ3JpZFtpXVtqXS5wdXNoKHYpO1xuICAgICAgdi5zZXRHcmlkQ29vcmRpbmF0ZXMoc3RhcnRYLCBmaW5pc2hYLCBzdGFydFksIGZpbmlzaFkpO1xuICAgIH1cbiAgfVxufTtcblxuRkRMYXlvdXQucHJvdG90eXBlLnVwZGF0ZUdyaWQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBpO1xuICB2YXIgbm9kZUE7XG4gIHZhciBsTm9kZXMgPSB0aGlzLmdldEFsbE5vZGVzKCk7XG5cbiAgdGhpcy5ncmlkID0gdGhpcy5jYWxjR3JpZCh0aGlzLmdyYXBoTWFuYWdlci5nZXRSb290KCkpO1xuXG4gIC8vIHB1dCBhbGwgbm9kZXMgdG8gcHJvcGVyIGdyaWQgY2VsbHNcbiAgZm9yIChpID0gMDsgaSA8IGxOb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgIG5vZGVBID0gbE5vZGVzW2ldO1xuICAgIHRoaXMuYWRkTm9kZVRvR3JpZChub2RlQSwgdGhpcy5ncmFwaE1hbmFnZXIuZ2V0Um9vdCgpLmdldExlZnQoKSwgdGhpcy5ncmFwaE1hbmFnZXIuZ2V0Um9vdCgpLmdldFRvcCgpKTtcbiAgfVxufTtcblxuRkRMYXlvdXQucHJvdG90eXBlLmNhbGN1bGF0ZVJlcHVsc2lvbkZvcmNlT2ZBTm9kZSA9IGZ1bmN0aW9uIChub2RlQSwgcHJvY2Vzc2VkTm9kZVNldCwgZ3JpZFVwZGF0ZUFsbG93ZWQsIGZvcmNlVG9Ob2RlU3Vycm91bmRpbmdVcGRhdGUpIHtcblxuICBpZiAodGhpcy50b3RhbEl0ZXJhdGlvbnMgJSBGRExheW91dENvbnN0YW50cy5HUklEX0NBTENVTEFUSU9OX0NIRUNLX1BFUklPRCA9PSAxICYmIGdyaWRVcGRhdGVBbGxvd2VkIHx8IGZvcmNlVG9Ob2RlU3Vycm91bmRpbmdVcGRhdGUpIHtcbiAgICB2YXIgc3Vycm91bmRpbmcgPSBuZXcgU2V0KCk7XG4gICAgbm9kZUEuc3Vycm91bmRpbmcgPSBuZXcgQXJyYXkoKTtcbiAgICB2YXIgbm9kZUI7XG4gICAgdmFyIGdyaWQgPSB0aGlzLmdyaWQ7XG5cbiAgICBmb3IgKHZhciBpID0gbm9kZUEuc3RhcnRYIC0gMTsgaSA8IG5vZGVBLmZpbmlzaFggKyAyOyBpKyspIHtcbiAgICAgIGZvciAodmFyIGogPSBub2RlQS5zdGFydFkgLSAxOyBqIDwgbm9kZUEuZmluaXNoWSArIDI7IGorKykge1xuICAgICAgICBpZiAoIShpIDwgMCB8fCBqIDwgMCB8fCBpID49IGdyaWQubGVuZ3RoIHx8IGogPj0gZ3JpZFswXS5sZW5ndGgpKSB7XG4gICAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBncmlkW2ldW2pdLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICBub2RlQiA9IGdyaWRbaV1bal1ba107XG5cbiAgICAgICAgICAgIC8vIElmIGJvdGggbm9kZXMgYXJlIG5vdCBtZW1iZXJzIG9mIHRoZSBzYW1lIGdyYXBoLCBcbiAgICAgICAgICAgIC8vIG9yIGJvdGggbm9kZXMgYXJlIHRoZSBzYW1lLCBza2lwLlxuICAgICAgICAgICAgaWYgKG5vZGVBLmdldE93bmVyKCkgIT0gbm9kZUIuZ2V0T3duZXIoKSB8fCBub2RlQSA9PSBub2RlQikge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlIHJlcHVsc2lvbiBmb3JjZSBiZXR3ZWVuXG4gICAgICAgICAgICAvLyBub2RlQSBhbmQgbm9kZUIgaGFzIGFscmVhZHkgYmVlbiBjYWxjdWxhdGVkXG4gICAgICAgICAgICBpZiAoIXByb2Nlc3NlZE5vZGVTZXQuaGFzKG5vZGVCKSAmJiAhc3Vycm91bmRpbmcuaGFzKG5vZGVCKSkge1xuICAgICAgICAgICAgICB2YXIgZGlzdGFuY2VYID0gTWF0aC5hYnMobm9kZUEuZ2V0Q2VudGVyWCgpIC0gbm9kZUIuZ2V0Q2VudGVyWCgpKSAtIChub2RlQS5nZXRXaWR0aCgpIC8gMiArIG5vZGVCLmdldFdpZHRoKCkgLyAyKTtcbiAgICAgICAgICAgICAgdmFyIGRpc3RhbmNlWSA9IE1hdGguYWJzKG5vZGVBLmdldENlbnRlclkoKSAtIG5vZGVCLmdldENlbnRlclkoKSkgLSAobm9kZUEuZ2V0SGVpZ2h0KCkgLyAyICsgbm9kZUIuZ2V0SGVpZ2h0KCkgLyAyKTtcblxuICAgICAgICAgICAgICAvLyBpZiB0aGUgZGlzdGFuY2UgYmV0d2VlbiBub2RlQSBhbmQgbm9kZUIgXG4gICAgICAgICAgICAgIC8vIGlzIGxlc3MgdGhlbiBjYWxjdWxhdGlvbiByYW5nZVxuICAgICAgICAgICAgICBpZiAoZGlzdGFuY2VYIDw9IHRoaXMucmVwdWxzaW9uUmFuZ2UgJiYgZGlzdGFuY2VZIDw9IHRoaXMucmVwdWxzaW9uUmFuZ2UpIHtcbiAgICAgICAgICAgICAgICAvL3RoZW4gYWRkIG5vZGVCIHRvIHN1cnJvdW5kaW5nIG9mIG5vZGVBXG4gICAgICAgICAgICAgICAgc3Vycm91bmRpbmcuYWRkKG5vZGVCKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIG5vZGVBLnN1cnJvdW5kaW5nID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShzdXJyb3VuZGluZykpO1xuICB9XG4gIGZvciAoaSA9IDA7IGkgPCBub2RlQS5zdXJyb3VuZGluZy5sZW5ndGg7IGkrKykge1xuICAgIHRoaXMuY2FsY1JlcHVsc2lvbkZvcmNlKG5vZGVBLCBub2RlQS5zdXJyb3VuZGluZ1tpXSk7XG4gIH1cbn07XG5cbkZETGF5b3V0LnByb3RvdHlwZS5jYWxjUmVwdWxzaW9uUmFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAwLjA7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZETGF5b3V0O1xuXG4vKioqLyB9KSxcbi8qIDE5ICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG5cbnZhciBMRWRnZSA9IF9fd2VicGFja19yZXF1aXJlX18oMSk7XG52YXIgRkRMYXlvdXRDb25zdGFudHMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDcpO1xuXG5mdW5jdGlvbiBGRExheW91dEVkZ2Uoc291cmNlLCB0YXJnZXQsIHZFZGdlKSB7XG4gIExFZGdlLmNhbGwodGhpcywgc291cmNlLCB0YXJnZXQsIHZFZGdlKTtcbiAgdGhpcy5pZGVhbExlbmd0aCA9IEZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfRURHRV9MRU5HVEg7XG59XG5cbkZETGF5b3V0RWRnZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKExFZGdlLnByb3RvdHlwZSk7XG5cbmZvciAodmFyIHByb3AgaW4gTEVkZ2UpIHtcbiAgRkRMYXlvdXRFZGdlW3Byb3BdID0gTEVkZ2VbcHJvcF07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRkRMYXlvdXRFZGdlO1xuXG4vKioqLyB9KSxcbi8qIDIwICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG5cbnZhciBMTm9kZSA9IF9fd2VicGFja19yZXF1aXJlX18oMyk7XG5cbmZ1bmN0aW9uIEZETGF5b3V0Tm9kZShnbSwgbG9jLCBzaXplLCB2Tm9kZSkge1xuICAvLyBhbHRlcm5hdGl2ZSBjb25zdHJ1Y3RvciBpcyBoYW5kbGVkIGluc2lkZSBMTm9kZVxuICBMTm9kZS5jYWxsKHRoaXMsIGdtLCBsb2MsIHNpemUsIHZOb2RlKTtcbiAgLy9TcHJpbmcsIHJlcHVsc2lvbiBhbmQgZ3Jhdml0YXRpb25hbCBmb3JjZXMgYWN0aW5nIG9uIHRoaXMgbm9kZVxuICB0aGlzLnNwcmluZ0ZvcmNlWCA9IDA7XG4gIHRoaXMuc3ByaW5nRm9yY2VZID0gMDtcbiAgdGhpcy5yZXB1bHNpb25Gb3JjZVggPSAwO1xuICB0aGlzLnJlcHVsc2lvbkZvcmNlWSA9IDA7XG4gIHRoaXMuZ3Jhdml0YXRpb25Gb3JjZVggPSAwO1xuICB0aGlzLmdyYXZpdGF0aW9uRm9yY2VZID0gMDtcbiAgLy9BbW91bnQgYnkgd2hpY2ggdGhpcyBub2RlIGlzIHRvIGJlIG1vdmVkIGluIHRoaXMgaXRlcmF0aW9uXG4gIHRoaXMuZGlzcGxhY2VtZW50WCA9IDA7XG4gIHRoaXMuZGlzcGxhY2VtZW50WSA9IDA7XG5cbiAgLy9TdGFydCBhbmQgZmluaXNoIGdyaWQgY29vcmRpbmF0ZXMgdGhhdCB0aGlzIG5vZGUgaXMgZmFsbGVuIGludG9cbiAgdGhpcy5zdGFydFggPSAwO1xuICB0aGlzLmZpbmlzaFggPSAwO1xuICB0aGlzLnN0YXJ0WSA9IDA7XG4gIHRoaXMuZmluaXNoWSA9IDA7XG5cbiAgLy9HZW9tZXRyaWMgbmVpZ2hib3JzIG9mIHRoaXMgbm9kZVxuICB0aGlzLnN1cnJvdW5kaW5nID0gW107XG59XG5cbkZETGF5b3V0Tm9kZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKExOb2RlLnByb3RvdHlwZSk7XG5cbmZvciAodmFyIHByb3AgaW4gTE5vZGUpIHtcbiAgRkRMYXlvdXROb2RlW3Byb3BdID0gTE5vZGVbcHJvcF07XG59XG5cbkZETGF5b3V0Tm9kZS5wcm90b3R5cGUuc2V0R3JpZENvb3JkaW5hdGVzID0gZnVuY3Rpb24gKF9zdGFydFgsIF9maW5pc2hYLCBfc3RhcnRZLCBfZmluaXNoWSkge1xuICB0aGlzLnN0YXJ0WCA9IF9zdGFydFg7XG4gIHRoaXMuZmluaXNoWCA9IF9maW5pc2hYO1xuICB0aGlzLnN0YXJ0WSA9IF9zdGFydFk7XG4gIHRoaXMuZmluaXNoWSA9IF9maW5pc2hZO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGRExheW91dE5vZGU7XG5cbi8qKiovIH0pLFxuLyogMjEgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cblxuZnVuY3Rpb24gRGltZW5zaW9uRCh3aWR0aCwgaGVpZ2h0KSB7XG4gIHRoaXMud2lkdGggPSAwO1xuICB0aGlzLmhlaWdodCA9IDA7XG4gIGlmICh3aWR0aCAhPT0gbnVsbCAmJiBoZWlnaHQgIT09IG51bGwpIHtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gIH1cbn1cblxuRGltZW5zaW9uRC5wcm90b3R5cGUuZ2V0V2lkdGggPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLndpZHRoO1xufTtcblxuRGltZW5zaW9uRC5wcm90b3R5cGUuc2V0V2lkdGggPSBmdW5jdGlvbiAod2lkdGgpIHtcbiAgdGhpcy53aWR0aCA9IHdpZHRoO1xufTtcblxuRGltZW5zaW9uRC5wcm90b3R5cGUuZ2V0SGVpZ2h0ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5oZWlnaHQ7XG59O1xuXG5EaW1lbnNpb25ELnByb3RvdHlwZS5zZXRIZWlnaHQgPSBmdW5jdGlvbiAoaGVpZ2h0KSB7XG4gIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEaW1lbnNpb25EO1xuXG4vKioqLyB9KSxcbi8qIDIyICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG5cbnZhciBVbmlxdWVJREdlbmVyZXRvciA9IF9fd2VicGFja19yZXF1aXJlX18oMTQpO1xuXG5mdW5jdGlvbiBIYXNoTWFwKCkge1xuICB0aGlzLm1hcCA9IHt9O1xuICB0aGlzLmtleXMgPSBbXTtcbn1cblxuSGFzaE1hcC5wcm90b3R5cGUucHV0ID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgdmFyIHRoZUlkID0gVW5pcXVlSURHZW5lcmV0b3IuY3JlYXRlSUQoa2V5KTtcbiAgaWYgKCF0aGlzLmNvbnRhaW5zKHRoZUlkKSkge1xuICAgIHRoaXMubWFwW3RoZUlkXSA9IHZhbHVlO1xuICAgIHRoaXMua2V5cy5wdXNoKGtleSk7XG4gIH1cbn07XG5cbkhhc2hNYXAucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24gKGtleSkge1xuICB2YXIgdGhlSWQgPSBVbmlxdWVJREdlbmVyZXRvci5jcmVhdGVJRChrZXkpO1xuICByZXR1cm4gdGhpcy5tYXBba2V5XSAhPSBudWxsO1xufTtcblxuSGFzaE1hcC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKGtleSkge1xuICB2YXIgdGhlSWQgPSBVbmlxdWVJREdlbmVyZXRvci5jcmVhdGVJRChrZXkpO1xuICByZXR1cm4gdGhpcy5tYXBbdGhlSWRdO1xufTtcblxuSGFzaE1hcC5wcm90b3R5cGUua2V5U2V0ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5rZXlzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBIYXNoTWFwO1xuXG4vKioqLyB9KSxcbi8qIDIzICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG5cbnZhciBVbmlxdWVJREdlbmVyZXRvciA9IF9fd2VicGFja19yZXF1aXJlX18oMTQpO1xuXG5mdW5jdGlvbiBIYXNoU2V0KCkge1xuICB0aGlzLnNldCA9IHt9O1xufVxuO1xuXG5IYXNoU2V0LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHZhciB0aGVJZCA9IFVuaXF1ZUlER2VuZXJldG9yLmNyZWF0ZUlEKG9iaik7XG4gIGlmICghdGhpcy5jb250YWlucyh0aGVJZCkpIHRoaXMuc2V0W3RoZUlkXSA9IG9iajtcbn07XG5cbkhhc2hTZXQucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgZGVsZXRlIHRoaXMuc2V0W1VuaXF1ZUlER2VuZXJldG9yLmNyZWF0ZUlEKG9iaildO1xufTtcblxuSGFzaFNldC5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc2V0ID0ge307XG59O1xuXG5IYXNoU2V0LnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIHRoaXMuc2V0W1VuaXF1ZUlER2VuZXJldG9yLmNyZWF0ZUlEKG9iaildID09IG9iajtcbn07XG5cbkhhc2hTZXQucHJvdG90eXBlLmlzRW1wdHkgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnNpemUoKSA9PT0gMDtcbn07XG5cbkhhc2hTZXQucHJvdG90eXBlLnNpemUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLnNldCkubGVuZ3RoO1xufTtcblxuLy9jb25jYXRzIHRoaXMuc2V0IHRvIHRoZSBnaXZlbiBsaXN0XG5IYXNoU2V0LnByb3RvdHlwZS5hZGRBbGxUbyA9IGZ1bmN0aW9uIChsaXN0KSB7XG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXModGhpcy5zZXQpO1xuICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBsaXN0LnB1c2godGhpcy5zZXRba2V5c1tpXV0pO1xuICB9XG59O1xuXG5IYXNoU2V0LnByb3RvdHlwZS5zaXplID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5zZXQpLmxlbmd0aDtcbn07XG5cbkhhc2hTZXQucHJvdG90eXBlLmFkZEFsbCA9IGZ1bmN0aW9uIChsaXN0KSB7XG4gIHZhciBzID0gbGlzdC5sZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgczsgaSsrKSB7XG4gICAgdmFyIHYgPSBsaXN0W2ldO1xuICAgIHRoaXMuYWRkKHYpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhhc2hTZXQ7XG5cbi8qKiovIH0pLFxuLyogMjQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuLyoqXG4gKiBBIGNsYXNzaWMgUXVpY2tzb3J0IGFsZ29yaXRobSB3aXRoIEhvYXJlJ3MgcGFydGl0aW9uXG4gKiAtIFdvcmtzIGFsc28gb24gTGlua2VkTGlzdCBvYmplY3RzXG4gKlxuICogQ29weXJpZ2h0OiBpLVZpcyBSZXNlYXJjaCBHcm91cCwgQmlsa2VudCBVbml2ZXJzaXR5LCAyMDA3IC0gcHJlc2VudFxuICovXG5cbnZhciBMaW5rZWRMaXN0ID0gX193ZWJwYWNrX3JlcXVpcmVfXygxMSk7XG5cbnZhciBRdWlja3NvcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUXVpY2tzb3J0KEEsIGNvbXBhcmVGdW5jdGlvbikge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUXVpY2tzb3J0KTtcblxuICAgICAgICBpZiAoY29tcGFyZUZ1bmN0aW9uICE9PSBudWxsIHx8IGNvbXBhcmVGdW5jdGlvbiAhPT0gdW5kZWZpbmVkKSB0aGlzLmNvbXBhcmVGdW5jdGlvbiA9IHRoaXMuX2RlZmF1bHRDb21wYXJlRnVuY3Rpb247XG5cbiAgICAgICAgdmFyIGxlbmd0aCA9IHZvaWQgMDtcbiAgICAgICAgaWYgKEEgaW5zdGFuY2VvZiBMaW5rZWRMaXN0KSBsZW5ndGggPSBBLnNpemUoKTtlbHNlIGxlbmd0aCA9IEEubGVuZ3RoO1xuXG4gICAgICAgIHRoaXMuX3F1aWNrc29ydChBLCAwLCBsZW5ndGggLSAxKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoUXVpY2tzb3J0LCBbe1xuICAgICAgICBrZXk6ICdfcXVpY2tzb3J0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9xdWlja3NvcnQoQSwgcCwgcikge1xuICAgICAgICAgICAgaWYgKHAgPCByKSB7XG4gICAgICAgICAgICAgICAgdmFyIHEgPSB0aGlzLl9wYXJ0aXRpb24oQSwgcCwgcik7XG4gICAgICAgICAgICAgICAgdGhpcy5fcXVpY2tzb3J0KEEsIHAsIHEpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3F1aWNrc29ydChBLCBxICsgMSwgcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ19wYXJ0aXRpb24nLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gX3BhcnRpdGlvbihBLCBwLCByKSB7XG4gICAgICAgICAgICB2YXIgeCA9IHRoaXMuX2dldChBLCBwKTtcbiAgICAgICAgICAgIHZhciBpID0gcDtcbiAgICAgICAgICAgIHZhciBqID0gcjtcbiAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKHRoaXMuY29tcGFyZUZ1bmN0aW9uKHgsIHRoaXMuX2dldChBLCBqKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgai0tO1xuICAgICAgICAgICAgICAgIH13aGlsZSAodGhpcy5jb21wYXJlRnVuY3Rpb24odGhpcy5fZ2V0KEEsIGkpLCB4KSkge1xuICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgfWlmIChpIDwgaikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zd2FwKEEsIGksIGopO1xuICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgIGotLTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgcmV0dXJuIGo7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ19nZXQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gX2dldChvYmplY3QsIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAob2JqZWN0IGluc3RhbmNlb2YgTGlua2VkTGlzdCkgcmV0dXJuIG9iamVjdC5nZXRfb2JqZWN0X2F0KGluZGV4KTtlbHNlIHJldHVybiBvYmplY3RbaW5kZXhdO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdfc2V0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXQob2JqZWN0LCBpbmRleCwgdmFsdWUpIHtcbiAgICAgICAgICAgIGlmIChvYmplY3QgaW5zdGFuY2VvZiBMaW5rZWRMaXN0KSBvYmplY3Quc2V0X29iamVjdF9hdChpbmRleCwgdmFsdWUpO2Vsc2Ugb2JqZWN0W2luZGV4XSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdfc3dhcCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc3dhcChBLCBpLCBqKSB7XG4gICAgICAgICAgICB2YXIgdGVtcCA9IHRoaXMuX2dldChBLCBpKTtcbiAgICAgICAgICAgIHRoaXMuX3NldChBLCBpLCB0aGlzLl9nZXQoQSwgaikpO1xuICAgICAgICAgICAgdGhpcy5fc2V0KEEsIGosIHRlbXApO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdfZGVmYXVsdENvbXBhcmVGdW5jdGlvbicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBfZGVmYXVsdENvbXBhcmVGdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYiA+IGE7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gUXVpY2tzb3J0O1xufSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFF1aWNrc29ydDtcblxuLyoqKi8gfSksXG4vKiAyNSAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcblxuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4vKipcbiAqICAgTmVlZGxlbWFuLVd1bnNjaCBhbGdvcml0aG0gaXMgYW4gcHJvY2VkdXJlIHRvIGNvbXB1dGUgdGhlIG9wdGltYWwgZ2xvYmFsIGFsaWdubWVudCBvZiB0d28gc3RyaW5nXG4gKiAgIHNlcXVlbmNlcyBieSBTLkIuTmVlZGxlbWFuIGFuZCBDLkQuV3Vuc2NoICgxOTcwKS5cbiAqXG4gKiAgIEFzaWRlIGZyb20gdGhlIGlucHV0cywgeW91IGNhbiBhc3NpZ24gdGhlIHNjb3JlcyBmb3IsXG4gKiAgIC0gTWF0Y2g6IFRoZSB0d28gY2hhcmFjdGVycyBhdCB0aGUgY3VycmVudCBpbmRleCBhcmUgc2FtZS5cbiAqICAgLSBNaXNtYXRjaDogVGhlIHR3byBjaGFyYWN0ZXJzIGF0IHRoZSBjdXJyZW50IGluZGV4IGFyZSBkaWZmZXJlbnQuXG4gKiAgIC0gSW5zZXJ0aW9uL0RlbGV0aW9uKGdhcHMpOiBUaGUgYmVzdCBhbGlnbm1lbnQgaW52b2x2ZXMgb25lIGxldHRlciBhbGlnbmluZyB0byBhIGdhcCBpbiB0aGUgb3RoZXIgc3RyaW5nLlxuICovXG5cbnZhciBOZWVkbGVtYW5XdW5zY2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTmVlZGxlbWFuV3Vuc2NoKHNlcXVlbmNlMSwgc2VxdWVuY2UyKSB7XG4gICAgICAgIHZhciBtYXRjaF9zY29yZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogMTtcbiAgICAgICAgdmFyIG1pc21hdGNoX3BlbmFsdHkgPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IC0xO1xuICAgICAgICB2YXIgZ2FwX3BlbmFsdHkgPSBhcmd1bWVudHMubGVuZ3RoID4gNCAmJiBhcmd1bWVudHNbNF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1s0XSA6IC0xO1xuXG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBOZWVkbGVtYW5XdW5zY2gpO1xuXG4gICAgICAgIHRoaXMuc2VxdWVuY2UxID0gc2VxdWVuY2UxO1xuICAgICAgICB0aGlzLnNlcXVlbmNlMiA9IHNlcXVlbmNlMjtcbiAgICAgICAgdGhpcy5tYXRjaF9zY29yZSA9IG1hdGNoX3Njb3JlO1xuICAgICAgICB0aGlzLm1pc21hdGNoX3BlbmFsdHkgPSBtaXNtYXRjaF9wZW5hbHR5O1xuICAgICAgICB0aGlzLmdhcF9wZW5hbHR5ID0gZ2FwX3BlbmFsdHk7XG5cbiAgICAgICAgLy8gSnVzdCB0aGUgcmVtb3ZlIHJlZHVuZGFuY3lcbiAgICAgICAgdGhpcy5pTWF4ID0gc2VxdWVuY2UxLmxlbmd0aCArIDE7XG4gICAgICAgIHRoaXMuak1heCA9IHNlcXVlbmNlMi5sZW5ndGggKyAxO1xuXG4gICAgICAgIC8vIEdyaWQgbWF0cml4IG9mIHNjb3Jlc1xuICAgICAgICB0aGlzLmdyaWQgPSBuZXcgQXJyYXkodGhpcy5pTWF4KTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmlNYXg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5ncmlkW2ldID0gbmV3IEFycmF5KHRoaXMuak1heCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5qTWF4OyBqKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdyaWRbaV1bal0gPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVHJhY2ViYWNrIG1hdHJpeCAoMkQgYXJyYXksIGVhY2ggY2VsbCBpcyBhbiBhcnJheSBvZiBib29sZWFuIHZhbHVlcyBmb3IgW2BEaWFnYCwgYFVwYCwgYExlZnRgXSBwb3NpdGlvbnMpXG4gICAgICAgIHRoaXMudHJhY2ViYWNrR3JpZCA9IG5ldyBBcnJheSh0aGlzLmlNYXgpO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgdGhpcy5pTWF4OyBfaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnRyYWNlYmFja0dyaWRbX2ldID0gbmV3IEFycmF5KHRoaXMuak1heCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIF9qID0gMDsgX2ogPCB0aGlzLmpNYXg7IF9qKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyYWNlYmFja0dyaWRbX2ldW19qXSA9IFtudWxsLCBudWxsLCBudWxsXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSBhbGlnbmVkIHNlcXVlbmNlcyAocmV0dXJuIG11bHRpcGxlIHBvc3NpYmlsaXRpZXMpXG4gICAgICAgIHRoaXMuYWxpZ25tZW50cyA9IFtdO1xuXG4gICAgICAgIC8vIEZpbmFsIGFsaWdubWVudCBzY29yZVxuICAgICAgICB0aGlzLnNjb3JlID0gLTE7XG5cbiAgICAgICAgLy8gQ2FsY3VsYXRlIHNjb3JlcyBhbmQgdHJhY2ViYWNrc1xuICAgICAgICB0aGlzLmNvbXB1dGVHcmlkcygpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhOZWVkbGVtYW5XdW5zY2gsIFt7XG4gICAgICAgIGtleTogXCJnZXRTY29yZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0U2NvcmUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zY29yZTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcImdldEFsaWdubWVudHNcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEFsaWdubWVudHMoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hbGlnbm1lbnRzO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTWFpbiBkeW5hbWljIHByb2dyYW1taW5nIHByb2NlZHVyZVxuXG4gICAgfSwge1xuICAgICAgICBrZXk6IFwiY29tcHV0ZUdyaWRzXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wdXRlR3JpZHMoKSB7XG4gICAgICAgICAgICAvLyBGaWxsIGluIHRoZSBmaXJzdCByb3dcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAxOyBqIDwgdGhpcy5qTWF4OyBqKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdyaWRbMF1bal0gPSB0aGlzLmdyaWRbMF1baiAtIDFdICsgdGhpcy5nYXBfcGVuYWx0eTtcbiAgICAgICAgICAgICAgICB0aGlzLnRyYWNlYmFja0dyaWRbMF1bal0gPSBbZmFsc2UsIGZhbHNlLCB0cnVlXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRmlsbCBpbiB0aGUgZmlyc3QgY29sdW1uXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IHRoaXMuaU1heDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmlkW2ldWzBdID0gdGhpcy5ncmlkW2kgLSAxXVswXSArIHRoaXMuZ2FwX3BlbmFsdHk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFjZWJhY2tHcmlkW2ldWzBdID0gW2ZhbHNlLCB0cnVlLCBmYWxzZV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEZpbGwgdGhlIHJlc3Qgb2YgdGhlIGdyaWRcbiAgICAgICAgICAgIGZvciAodmFyIF9pMiA9IDE7IF9pMiA8IHRoaXMuaU1heDsgX2kyKyspIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfajIgPSAxOyBfajIgPCB0aGlzLmpNYXg7IF9qMisrKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEZpbmQgdGhlIG1heCBzY29yZShzKSBhbW9uZyBbYERpYWdgLCBgVXBgLCBgTGVmdGBdXG4gICAgICAgICAgICAgICAgICAgIHZhciBkaWFnID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zZXF1ZW5jZTFbX2kyIC0gMV0gPT09IHRoaXMuc2VxdWVuY2UyW19qMiAtIDFdKSBkaWFnID0gdGhpcy5ncmlkW19pMiAtIDFdW19qMiAtIDFdICsgdGhpcy5tYXRjaF9zY29yZTtlbHNlIGRpYWcgPSB0aGlzLmdyaWRbX2kyIC0gMV1bX2oyIC0gMV0gKyB0aGlzLm1pc21hdGNoX3BlbmFsdHk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHVwID0gdGhpcy5ncmlkW19pMiAtIDFdW19qMl0gKyB0aGlzLmdhcF9wZW5hbHR5O1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGVmdCA9IHRoaXMuZ3JpZFtfaTJdW19qMiAtIDFdICsgdGhpcy5nYXBfcGVuYWx0eTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBleGlzdHMgbXVsdGlwbGUgbWF4IHZhbHVlcywgY2FwdHVyZSB0aGVtIGZvciBtdWx0aXBsZSBwYXRoc1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWF4T2YgPSBbZGlhZywgdXAsIGxlZnRdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5kaWNlcyA9IHRoaXMuYXJyYXlBbGxNYXhJbmRleGVzKG1heE9mKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBVcGRhdGUgR3JpZHNcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmlkW19pMl1bX2oyXSA9IG1heE9mW2luZGljZXNbMF1dO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYWNlYmFja0dyaWRbX2kyXVtfajJdID0gW2luZGljZXMuaW5jbHVkZXMoMCksIGluZGljZXMuaW5jbHVkZXMoMSksIGluZGljZXMuaW5jbHVkZXMoMildO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVXBkYXRlIGFsaWdubWVudCBzY29yZVxuICAgICAgICAgICAgdGhpcy5zY29yZSA9IHRoaXMuZ3JpZFt0aGlzLmlNYXggLSAxXVt0aGlzLmpNYXggLSAxXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdldHMgYWxsIHBvc3NpYmxlIHZhbGlkIHNlcXVlbmNlIGNvbWJpbmF0aW9uc1xuXG4gICAgfSwge1xuICAgICAgICBrZXk6IFwiYWxpZ25tZW50VHJhY2ViYWNrXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBhbGlnbm1lbnRUcmFjZWJhY2soKSB7XG4gICAgICAgICAgICB2YXIgaW5Qcm9jZXNzQWxpZ25tZW50cyA9IFtdO1xuXG4gICAgICAgICAgICBpblByb2Nlc3NBbGlnbm1lbnRzLnB1c2goeyBwb3M6IFt0aGlzLnNlcXVlbmNlMS5sZW5ndGgsIHRoaXMuc2VxdWVuY2UyLmxlbmd0aF0sXG4gICAgICAgICAgICAgICAgc2VxMTogXCJcIixcbiAgICAgICAgICAgICAgICBzZXEyOiBcIlwiXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgd2hpbGUgKGluUHJvY2Vzc0FsaWdubWVudHNbMF0pIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudCA9IGluUHJvY2Vzc0FsaWdubWVudHNbMF07XG4gICAgICAgICAgICAgICAgdmFyIGRpcmVjdGlvbnMgPSB0aGlzLnRyYWNlYmFja0dyaWRbY3VycmVudC5wb3NbMF1dW2N1cnJlbnQucG9zWzFdXTtcblxuICAgICAgICAgICAgICAgIGlmIChkaXJlY3Rpb25zWzBdKSB7XG4gICAgICAgICAgICAgICAgICAgIGluUHJvY2Vzc0FsaWdubWVudHMucHVzaCh7IHBvczogW2N1cnJlbnQucG9zWzBdIC0gMSwgY3VycmVudC5wb3NbMV0gLSAxXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcTE6IHRoaXMuc2VxdWVuY2UxW2N1cnJlbnQucG9zWzBdIC0gMV0gKyBjdXJyZW50LnNlcTEsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXEyOiB0aGlzLnNlcXVlbmNlMltjdXJyZW50LnBvc1sxXSAtIDFdICsgY3VycmVudC5zZXEyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZGlyZWN0aW9uc1sxXSkge1xuICAgICAgICAgICAgICAgICAgICBpblByb2Nlc3NBbGlnbm1lbnRzLnB1c2goeyBwb3M6IFtjdXJyZW50LnBvc1swXSAtIDEsIGN1cnJlbnQucG9zWzFdXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcTE6IHRoaXMuc2VxdWVuY2UxW2N1cnJlbnQucG9zWzBdIC0gMV0gKyBjdXJyZW50LnNlcTEsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXEyOiAnLScgKyBjdXJyZW50LnNlcTJcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChkaXJlY3Rpb25zWzJdKSB7XG4gICAgICAgICAgICAgICAgICAgIGluUHJvY2Vzc0FsaWdubWVudHMucHVzaCh7IHBvczogW2N1cnJlbnQucG9zWzBdLCBjdXJyZW50LnBvc1sxXSAtIDFdLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VxMTogJy0nICsgY3VycmVudC5zZXExLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VxMjogdGhpcy5zZXF1ZW5jZTJbY3VycmVudC5wb3NbMV0gLSAxXSArIGN1cnJlbnQuc2VxMlxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudC5wb3NbMF0gPT09IDAgJiYgY3VycmVudC5wb3NbMV0gPT09IDApIHRoaXMuYWxpZ25tZW50cy5wdXNoKHsgc2VxdWVuY2UxOiBjdXJyZW50LnNlcTEsXG4gICAgICAgICAgICAgICAgICAgIHNlcXVlbmNlMjogY3VycmVudC5zZXEyXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpblByb2Nlc3NBbGlnbm1lbnRzLnNoaWZ0KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFsaWdubWVudHM7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBIZWxwZXIgRnVuY3Rpb25zXG5cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJnZXRBbGxJbmRleGVzXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRBbGxJbmRleGVzKGFyciwgdmFsKSB7XG4gICAgICAgICAgICB2YXIgaW5kZXhlcyA9IFtdLFxuICAgICAgICAgICAgICAgIGkgPSAtMTtcbiAgICAgICAgICAgIHdoaWxlICgoaSA9IGFyci5pbmRleE9mKHZhbCwgaSArIDEpKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBpbmRleGVzLnB1c2goaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaW5kZXhlcztcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcImFycmF5QWxsTWF4SW5kZXhlc1wiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gYXJyYXlBbGxNYXhJbmRleGVzKGFycmF5KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRBbGxJbmRleGVzKGFycmF5LCBNYXRoLm1heC5hcHBseShudWxsLCBhcnJheSkpO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIE5lZWRsZW1hbld1bnNjaDtcbn0oKTtcblxubW9kdWxlLmV4cG9ydHMgPSBOZWVkbGVtYW5XdW5zY2g7XG5cbi8qKiovIH0pLFxuLyogMjYgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cblxudmFyIGxheW91dEJhc2UgPSBmdW5jdGlvbiBsYXlvdXRCYXNlKCkge1xuICByZXR1cm47XG59O1xuXG5sYXlvdXRCYXNlLkZETGF5b3V0ID0gX193ZWJwYWNrX3JlcXVpcmVfXygxOCk7XG5sYXlvdXRCYXNlLkZETGF5b3V0Q29uc3RhbnRzID0gX193ZWJwYWNrX3JlcXVpcmVfXyg3KTtcbmxheW91dEJhc2UuRkRMYXlvdXRFZGdlID0gX193ZWJwYWNrX3JlcXVpcmVfXygxOSk7XG5sYXlvdXRCYXNlLkZETGF5b3V0Tm9kZSA9IF9fd2VicGFja19yZXF1aXJlX18oMjApO1xubGF5b3V0QmFzZS5EaW1lbnNpb25EID0gX193ZWJwYWNrX3JlcXVpcmVfXygyMSk7XG5sYXlvdXRCYXNlLkhhc2hNYXAgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDIyKTtcbmxheW91dEJhc2UuSGFzaFNldCA9IF9fd2VicGFja19yZXF1aXJlX18oMjMpO1xubGF5b3V0QmFzZS5JR2VvbWV0cnkgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDgpO1xubGF5b3V0QmFzZS5JTWF0aCA9IF9fd2VicGFja19yZXF1aXJlX18oOSk7XG5sYXlvdXRCYXNlLkludGVnZXIgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEwKTtcbmxheW91dEJhc2UuUG9pbnQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEyKTtcbmxheW91dEJhc2UuUG9pbnREID0gX193ZWJwYWNrX3JlcXVpcmVfXyg0KTtcbmxheW91dEJhc2UuUmFuZG9tU2VlZCA9IF9fd2VicGFja19yZXF1aXJlX18oMTYpO1xubGF5b3V0QmFzZS5SZWN0YW5nbGVEID0gX193ZWJwYWNrX3JlcXVpcmVfXygxMyk7XG5sYXlvdXRCYXNlLlRyYW5zZm9ybSA9IF9fd2VicGFja19yZXF1aXJlX18oMTcpO1xubGF5b3V0QmFzZS5VbmlxdWVJREdlbmVyZXRvciA9IF9fd2VicGFja19yZXF1aXJlX18oMTQpO1xubGF5b3V0QmFzZS5RdWlja3NvcnQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDI0KTtcbmxheW91dEJhc2UuTGlua2VkTGlzdCA9IF9fd2VicGFja19yZXF1aXJlX18oMTEpO1xubGF5b3V0QmFzZS5MR3JhcGhPYmplY3QgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDIpO1xubGF5b3V0QmFzZS5MR3JhcGggPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDUpO1xubGF5b3V0QmFzZS5MRWRnZSA9IF9fd2VicGFja19yZXF1aXJlX18oMSk7XG5sYXlvdXRCYXNlLkxHcmFwaE1hbmFnZXIgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDYpO1xubGF5b3V0QmFzZS5MTm9kZSA9IF9fd2VicGFja19yZXF1aXJlX18oMyk7XG5sYXlvdXRCYXNlLkxheW91dCA9IF9fd2VicGFja19yZXF1aXJlX18oMTUpO1xubGF5b3V0QmFzZS5MYXlvdXRDb25zdGFudHMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xubGF5b3V0QmFzZS5OZWVkbGVtYW5XdW5zY2ggPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDI1KTtcblxubW9kdWxlLmV4cG9ydHMgPSBsYXlvdXRCYXNlO1xuXG4vKioqLyB9KSxcbi8qIDI3ICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG5cbmZ1bmN0aW9uIEVtaXR0ZXIoKSB7XG4gIHRoaXMubGlzdGVuZXJzID0gW107XG59XG5cbnZhciBwID0gRW1pdHRlci5wcm90b3R5cGU7XG5cbnAuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbiAoZXZlbnQsIGNhbGxiYWNrKSB7XG4gIHRoaXMubGlzdGVuZXJzLnB1c2goe1xuICAgIGV2ZW50OiBldmVudCxcbiAgICBjYWxsYmFjazogY2FsbGJhY2tcbiAgfSk7XG59O1xuXG5wLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gKGV2ZW50LCBjYWxsYmFjaykge1xuICBmb3IgKHZhciBpID0gdGhpcy5saXN0ZW5lcnMubGVuZ3RoOyBpID49IDA7IGktLSkge1xuICAgIHZhciBsID0gdGhpcy5saXN0ZW5lcnNbaV07XG5cbiAgICBpZiAobC5ldmVudCA9PT0gZXZlbnQgJiYgbC5jYWxsYmFjayA9PT0gY2FsbGJhY2spIHtcbiAgICAgIHRoaXMubGlzdGVuZXJzLnNwbGljZShpLCAxKTtcbiAgICB9XG4gIH1cbn07XG5cbnAuZW1pdCA9IGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGwgPSB0aGlzLmxpc3RlbmVyc1tpXTtcblxuICAgIGlmIChldmVudCA9PT0gbC5ldmVudCkge1xuICAgICAgbC5jYWxsYmFjayhkYXRhKTtcbiAgICB9XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRW1pdHRlcjtcblxuLyoqKi8gfSlcbi8qKioqKiovIF0pO1xufSk7IiwKICAgICIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoXCJsYXlvdXQtYmFzZVwiKSk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXCJsYXlvdXQtYmFzZVwiXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJjb3NlQmFzZVwiXSA9IGZhY3RvcnkocmVxdWlyZShcImxheW91dC1iYXNlXCIpKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJjb3NlQmFzZVwiXSA9IGZhY3Rvcnkocm9vdFtcImxheW91dEJhc2VcIl0pO1xufSkodGhpcywgZnVuY3Rpb24oX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV8wX18pIHtcbnJldHVybiAvKioqKioqLyAoZnVuY3Rpb24obW9kdWxlcykgeyAvLyB3ZWJwYWNrQm9vdHN0cmFwXG4vKioqKioqLyBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4vKioqKioqLyBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4vKioqKioqLyBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbi8qKioqKiovIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuLyoqKioqKi8gXHRcdH1cbi8qKioqKiovIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuLyoqKioqKi8gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbi8qKioqKiovIFx0XHRcdGk6IG1vZHVsZUlkLFxuLyoqKioqKi8gXHRcdFx0bDogZmFsc2UsXG4vKioqKioqLyBcdFx0XHRleHBvcnRzOiB7fVxuLyoqKioqKi8gXHRcdH07XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuLyoqKioqKi8gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4vKioqKioqLyBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuLyoqKioqKi8gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbi8qKioqKiovIFx0fVxuLyoqKioqKi9cbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gaWRlbnRpdHkgZnVuY3Rpb24gZm9yIGNhbGxpbmcgaGFybW9ueSBpbXBvcnRzIHdpdGggdGhlIGNvcnJlY3QgY29udGV4dFxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmkgPSBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4vKioqKioqLyBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuLyoqKioqKi8gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbi8qKioqKiovIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbi8qKioqKiovIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbi8qKioqKiovIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbi8qKioqKiovIFx0XHRcdH0pO1xuLyoqKioqKi8gXHRcdH1cbi8qKioqKiovIFx0fTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuLyoqKioqKi8gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuLyoqKioqKi8gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbi8qKioqKiovIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4vKioqKioqLyBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuLyoqKioqKi8gXHRcdHJldHVybiBnZXR0ZXI7XG4vKioqKioqLyBcdH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLyoqKioqKi8gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSA3KTtcbi8qKioqKiovIH0pXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gKFtcbi8qIDAgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxubW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzBfXztcblxuLyoqKi8gfSksXG4vKiAxICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG5cbnZhciBGRExheW91dENvbnN0YW50cyA9IF9fd2VicGFja19yZXF1aXJlX18oMCkuRkRMYXlvdXRDb25zdGFudHM7XG5cbmZ1bmN0aW9uIENvU0VDb25zdGFudHMoKSB7fVxuXG4vL0NvU0VDb25zdGFudHMgaW5oZXJpdHMgc3RhdGljIHByb3BzIGluIEZETGF5b3V0Q29uc3RhbnRzXG5mb3IgKHZhciBwcm9wIGluIEZETGF5b3V0Q29uc3RhbnRzKSB7XG4gIENvU0VDb25zdGFudHNbcHJvcF0gPSBGRExheW91dENvbnN0YW50c1twcm9wXTtcbn1cblxuQ29TRUNvbnN0YW50cy5ERUZBVUxUX1VTRV9NVUxUSV9MRVZFTF9TQ0FMSU5HID0gZmFsc2U7XG5Db1NFQ29uc3RhbnRzLkRFRkFVTFRfUkFESUFMX1NFUEFSQVRJT04gPSBGRExheW91dENvbnN0YW50cy5ERUZBVUxUX0VER0VfTEVOR1RIO1xuQ29TRUNvbnN0YW50cy5ERUZBVUxUX0NPTVBPTkVOVF9TRVBFUkFUSU9OID0gNjA7XG5Db1NFQ29uc3RhbnRzLlRJTEUgPSB0cnVlO1xuQ29TRUNvbnN0YW50cy5USUxJTkdfUEFERElOR19WRVJUSUNBTCA9IDEwO1xuQ29TRUNvbnN0YW50cy5USUxJTkdfUEFERElOR19IT1JJWk9OVEFMID0gMTA7XG5Db1NFQ29uc3RhbnRzLlRSRUVfUkVEVUNUSU9OX09OX0lOQ1JFTUVOVEFMID0gZmFsc2U7IC8vIG1ha2UgdGhpcyB0cnVlIHdoZW4gY29zZSBpcyB1c2VkIGluY3JlbWVudGFsbHkgYXMgYSBwYXJ0IG9mIG90aGVyIG5vbi1pbmNyZW1lbnRhbCBsYXlvdXRcblxubW9kdWxlLmV4cG9ydHMgPSBDb1NFQ29uc3RhbnRzO1xuXG4vKioqLyB9KSxcbi8qIDIgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cblxudmFyIEZETGF5b3V0RWRnZSA9IF9fd2VicGFja19yZXF1aXJlX18oMCkuRkRMYXlvdXRFZGdlO1xuXG5mdW5jdGlvbiBDb1NFRWRnZShzb3VyY2UsIHRhcmdldCwgdkVkZ2UpIHtcbiAgRkRMYXlvdXRFZGdlLmNhbGwodGhpcywgc291cmNlLCB0YXJnZXQsIHZFZGdlKTtcbn1cblxuQ29TRUVkZ2UucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShGRExheW91dEVkZ2UucHJvdG90eXBlKTtcbmZvciAodmFyIHByb3AgaW4gRkRMYXlvdXRFZGdlKSB7XG4gIENvU0VFZGdlW3Byb3BdID0gRkRMYXlvdXRFZGdlW3Byb3BdO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvU0VFZGdlO1xuXG4vKioqLyB9KSxcbi8qIDMgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cblxudmFyIExHcmFwaCA9IF9fd2VicGFja19yZXF1aXJlX18oMCkuTEdyYXBoO1xuXG5mdW5jdGlvbiBDb1NFR3JhcGgocGFyZW50LCBncmFwaE1nciwgdkdyYXBoKSB7XG4gIExHcmFwaC5jYWxsKHRoaXMsIHBhcmVudCwgZ3JhcGhNZ3IsIHZHcmFwaCk7XG59XG5cbkNvU0VHcmFwaC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKExHcmFwaC5wcm90b3R5cGUpO1xuZm9yICh2YXIgcHJvcCBpbiBMR3JhcGgpIHtcbiAgQ29TRUdyYXBoW3Byb3BdID0gTEdyYXBoW3Byb3BdO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvU0VHcmFwaDtcblxuLyoqKi8gfSksXG4vKiA0ICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG5cbnZhciBMR3JhcGhNYW5hZ2VyID0gX193ZWJwYWNrX3JlcXVpcmVfXygwKS5MR3JhcGhNYW5hZ2VyO1xuXG5mdW5jdGlvbiBDb1NFR3JhcGhNYW5hZ2VyKGxheW91dCkge1xuICBMR3JhcGhNYW5hZ2VyLmNhbGwodGhpcywgbGF5b3V0KTtcbn1cblxuQ29TRUdyYXBoTWFuYWdlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKExHcmFwaE1hbmFnZXIucHJvdG90eXBlKTtcbmZvciAodmFyIHByb3AgaW4gTEdyYXBoTWFuYWdlcikge1xuICBDb1NFR3JhcGhNYW5hZ2VyW3Byb3BdID0gTEdyYXBoTWFuYWdlcltwcm9wXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb1NFR3JhcGhNYW5hZ2VyO1xuXG4vKioqLyB9KSxcbi8qIDUgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cblxudmFyIEZETGF5b3V0Tm9kZSA9IF9fd2VicGFja19yZXF1aXJlX18oMCkuRkRMYXlvdXROb2RlO1xudmFyIElNYXRoID0gX193ZWJwYWNrX3JlcXVpcmVfXygwKS5JTWF0aDtcblxuZnVuY3Rpb24gQ29TRU5vZGUoZ20sIGxvYywgc2l6ZSwgdk5vZGUpIHtcbiAgRkRMYXlvdXROb2RlLmNhbGwodGhpcywgZ20sIGxvYywgc2l6ZSwgdk5vZGUpO1xufVxuXG5Db1NFTm9kZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEZETGF5b3V0Tm9kZS5wcm90b3R5cGUpO1xuZm9yICh2YXIgcHJvcCBpbiBGRExheW91dE5vZGUpIHtcbiAgQ29TRU5vZGVbcHJvcF0gPSBGRExheW91dE5vZGVbcHJvcF07XG59XG5cbkNvU0VOb2RlLnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbGF5b3V0ID0gdGhpcy5ncmFwaE1hbmFnZXIuZ2V0TGF5b3V0KCk7XG4gIHRoaXMuZGlzcGxhY2VtZW50WCA9IGxheW91dC5jb29saW5nRmFjdG9yICogKHRoaXMuc3ByaW5nRm9yY2VYICsgdGhpcy5yZXB1bHNpb25Gb3JjZVggKyB0aGlzLmdyYXZpdGF0aW9uRm9yY2VYKSAvIHRoaXMubm9PZkNoaWxkcmVuO1xuICB0aGlzLmRpc3BsYWNlbWVudFkgPSBsYXlvdXQuY29vbGluZ0ZhY3RvciAqICh0aGlzLnNwcmluZ0ZvcmNlWSArIHRoaXMucmVwdWxzaW9uRm9yY2VZICsgdGhpcy5ncmF2aXRhdGlvbkZvcmNlWSkgLyB0aGlzLm5vT2ZDaGlsZHJlbjtcblxuICBpZiAoTWF0aC5hYnModGhpcy5kaXNwbGFjZW1lbnRYKSA+IGxheW91dC5jb29saW5nRmFjdG9yICogbGF5b3V0Lm1heE5vZGVEaXNwbGFjZW1lbnQpIHtcbiAgICB0aGlzLmRpc3BsYWNlbWVudFggPSBsYXlvdXQuY29vbGluZ0ZhY3RvciAqIGxheW91dC5tYXhOb2RlRGlzcGxhY2VtZW50ICogSU1hdGguc2lnbih0aGlzLmRpc3BsYWNlbWVudFgpO1xuICB9XG5cbiAgaWYgKE1hdGguYWJzKHRoaXMuZGlzcGxhY2VtZW50WSkgPiBsYXlvdXQuY29vbGluZ0ZhY3RvciAqIGxheW91dC5tYXhOb2RlRGlzcGxhY2VtZW50KSB7XG4gICAgdGhpcy5kaXNwbGFjZW1lbnRZID0gbGF5b3V0LmNvb2xpbmdGYWN0b3IgKiBsYXlvdXQubWF4Tm9kZURpc3BsYWNlbWVudCAqIElNYXRoLnNpZ24odGhpcy5kaXNwbGFjZW1lbnRZKTtcbiAgfVxuXG4gIC8vIGEgc2ltcGxlIG5vZGUsIGp1c3QgbW92ZSBpdFxuICBpZiAodGhpcy5jaGlsZCA9PSBudWxsKSB7XG4gICAgdGhpcy5tb3ZlQnkodGhpcy5kaXNwbGFjZW1lbnRYLCB0aGlzLmRpc3BsYWNlbWVudFkpO1xuICB9XG4gIC8vIGFuIGVtcHR5IGNvbXBvdW5kIG5vZGUsIGFnYWluIGp1c3QgbW92ZSBpdFxuICBlbHNlIGlmICh0aGlzLmNoaWxkLmdldE5vZGVzKCkubGVuZ3RoID09IDApIHtcbiAgICAgIHRoaXMubW92ZUJ5KHRoaXMuZGlzcGxhY2VtZW50WCwgdGhpcy5kaXNwbGFjZW1lbnRZKTtcbiAgICB9XG4gICAgLy8gbm9uLWVtcHR5IGNvbXBvdW5kIG5vZGUsIHByb3BvZ2F0ZSBtb3ZlbWVudCB0byBjaGlsZHJlbiBhcyB3ZWxsXG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMucHJvcG9nYXRlRGlzcGxhY2VtZW50VG9DaGlsZHJlbih0aGlzLmRpc3BsYWNlbWVudFgsIHRoaXMuZGlzcGxhY2VtZW50WSk7XG4gICAgICB9XG5cbiAgbGF5b3V0LnRvdGFsRGlzcGxhY2VtZW50ICs9IE1hdGguYWJzKHRoaXMuZGlzcGxhY2VtZW50WCkgKyBNYXRoLmFicyh0aGlzLmRpc3BsYWNlbWVudFkpO1xuXG4gIHRoaXMuc3ByaW5nRm9yY2VYID0gMDtcbiAgdGhpcy5zcHJpbmdGb3JjZVkgPSAwO1xuICB0aGlzLnJlcHVsc2lvbkZvcmNlWCA9IDA7XG4gIHRoaXMucmVwdWxzaW9uRm9yY2VZID0gMDtcbiAgdGhpcy5ncmF2aXRhdGlvbkZvcmNlWCA9IDA7XG4gIHRoaXMuZ3Jhdml0YXRpb25Gb3JjZVkgPSAwO1xuICB0aGlzLmRpc3BsYWNlbWVudFggPSAwO1xuICB0aGlzLmRpc3BsYWNlbWVudFkgPSAwO1xufTtcblxuQ29TRU5vZGUucHJvdG90eXBlLnByb3BvZ2F0ZURpc3BsYWNlbWVudFRvQ2hpbGRyZW4gPSBmdW5jdGlvbiAoZFgsIGRZKSB7XG4gIHZhciBub2RlcyA9IHRoaXMuZ2V0Q2hpbGQoKS5nZXROb2RlcygpO1xuICB2YXIgbm9kZTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgIG5vZGUgPSBub2Rlc1tpXTtcbiAgICBpZiAobm9kZS5nZXRDaGlsZCgpID09IG51bGwpIHtcbiAgICAgIG5vZGUubW92ZUJ5KGRYLCBkWSk7XG4gICAgICBub2RlLmRpc3BsYWNlbWVudFggKz0gZFg7XG4gICAgICBub2RlLmRpc3BsYWNlbWVudFkgKz0gZFk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGUucHJvcG9nYXRlRGlzcGxhY2VtZW50VG9DaGlsZHJlbihkWCwgZFkpO1xuICAgIH1cbiAgfVxufTtcblxuQ29TRU5vZGUucHJvdG90eXBlLnNldFByZWQxID0gZnVuY3Rpb24gKHByZWQxKSB7XG4gIHRoaXMucHJlZDEgPSBwcmVkMTtcbn07XG5cbkNvU0VOb2RlLnByb3RvdHlwZS5nZXRQcmVkMSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHByZWQxO1xufTtcblxuQ29TRU5vZGUucHJvdG90eXBlLmdldFByZWQyID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gcHJlZDI7XG59O1xuXG5Db1NFTm9kZS5wcm90b3R5cGUuc2V0TmV4dCA9IGZ1bmN0aW9uIChuZXh0KSB7XG4gIHRoaXMubmV4dCA9IG5leHQ7XG59O1xuXG5Db1NFTm9kZS5wcm90b3R5cGUuZ2V0TmV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIG5leHQ7XG59O1xuXG5Db1NFTm9kZS5wcm90b3R5cGUuc2V0UHJvY2Vzc2VkID0gZnVuY3Rpb24gKHByb2Nlc3NlZCkge1xuICB0aGlzLnByb2Nlc3NlZCA9IHByb2Nlc3NlZDtcbn07XG5cbkNvU0VOb2RlLnByb3RvdHlwZS5pc1Byb2Nlc3NlZCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHByb2Nlc3NlZDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ29TRU5vZGU7XG5cbi8qKiovIH0pLFxuLyogNiAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcblxuXG52YXIgRkRMYXlvdXQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDApLkZETGF5b3V0O1xudmFyIENvU0VHcmFwaE1hbmFnZXIgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDQpO1xudmFyIENvU0VHcmFwaCA9IF9fd2VicGFja19yZXF1aXJlX18oMyk7XG52YXIgQ29TRU5vZGUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDUpO1xudmFyIENvU0VFZGdlID0gX193ZWJwYWNrX3JlcXVpcmVfXygyKTtcbnZhciBDb1NFQ29uc3RhbnRzID0gX193ZWJwYWNrX3JlcXVpcmVfXygxKTtcbnZhciBGRExheW91dENvbnN0YW50cyA9IF9fd2VicGFja19yZXF1aXJlX18oMCkuRkRMYXlvdXRDb25zdGFudHM7XG52YXIgTGF5b3V0Q29uc3RhbnRzID0gX193ZWJwYWNrX3JlcXVpcmVfXygwKS5MYXlvdXRDb25zdGFudHM7XG52YXIgUG9pbnQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDApLlBvaW50O1xudmFyIFBvaW50RCA9IF9fd2VicGFja19yZXF1aXJlX18oMCkuUG9pbnREO1xudmFyIExheW91dCA9IF9fd2VicGFja19yZXF1aXJlX18oMCkuTGF5b3V0O1xudmFyIEludGVnZXIgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDApLkludGVnZXI7XG52YXIgSUdlb21ldHJ5ID0gX193ZWJwYWNrX3JlcXVpcmVfXygwKS5JR2VvbWV0cnk7XG52YXIgTEdyYXBoID0gX193ZWJwYWNrX3JlcXVpcmVfXygwKS5MR3JhcGg7XG52YXIgVHJhbnNmb3JtID0gX193ZWJwYWNrX3JlcXVpcmVfXygwKS5UcmFuc2Zvcm07XG5cbmZ1bmN0aW9uIENvU0VMYXlvdXQoKSB7XG4gIEZETGF5b3V0LmNhbGwodGhpcyk7XG5cbiAgdGhpcy50b0JlVGlsZWQgPSB7fTsgLy8gTWVtb3JpemUgaWYgYSBub2RlIGlzIHRvIGJlIHRpbGVkIG9yIGlzIHRpbGVkXG59XG5cbkNvU0VMYXlvdXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShGRExheW91dC5wcm90b3R5cGUpO1xuXG5mb3IgKHZhciBwcm9wIGluIEZETGF5b3V0KSB7XG4gIENvU0VMYXlvdXRbcHJvcF0gPSBGRExheW91dFtwcm9wXTtcbn1cblxuQ29TRUxheW91dC5wcm90b3R5cGUubmV3R3JhcGhNYW5hZ2VyID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZ20gPSBuZXcgQ29TRUdyYXBoTWFuYWdlcih0aGlzKTtcbiAgdGhpcy5ncmFwaE1hbmFnZXIgPSBnbTtcbiAgcmV0dXJuIGdtO1xufTtcblxuQ29TRUxheW91dC5wcm90b3R5cGUubmV3R3JhcGggPSBmdW5jdGlvbiAodkdyYXBoKSB7XG4gIHJldHVybiBuZXcgQ29TRUdyYXBoKG51bGwsIHRoaXMuZ3JhcGhNYW5hZ2VyLCB2R3JhcGgpO1xufTtcblxuQ29TRUxheW91dC5wcm90b3R5cGUubmV3Tm9kZSA9IGZ1bmN0aW9uICh2Tm9kZSkge1xuICByZXR1cm4gbmV3IENvU0VOb2RlKHRoaXMuZ3JhcGhNYW5hZ2VyLCB2Tm9kZSk7XG59O1xuXG5Db1NFTGF5b3V0LnByb3RvdHlwZS5uZXdFZGdlID0gZnVuY3Rpb24gKHZFZGdlKSB7XG4gIHJldHVybiBuZXcgQ29TRUVkZ2UobnVsbCwgbnVsbCwgdkVkZ2UpO1xufTtcblxuQ29TRUxheW91dC5wcm90b3R5cGUuaW5pdFBhcmFtZXRlcnMgPSBmdW5jdGlvbiAoKSB7XG4gIEZETGF5b3V0LnByb3RvdHlwZS5pbml0UGFyYW1ldGVycy5jYWxsKHRoaXMsIGFyZ3VtZW50cyk7XG4gIGlmICghdGhpcy5pc1N1YkxheW91dCkge1xuICAgIGlmIChDb1NFQ29uc3RhbnRzLkRFRkFVTFRfRURHRV9MRU5HVEggPCAxMCkge1xuICAgICAgdGhpcy5pZGVhbEVkZ2VMZW5ndGggPSAxMDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5pZGVhbEVkZ2VMZW5ndGggPSBDb1NFQ29uc3RhbnRzLkRFRkFVTFRfRURHRV9MRU5HVEg7XG4gICAgfVxuXG4gICAgdGhpcy51c2VTbWFydElkZWFsRWRnZUxlbmd0aENhbGN1bGF0aW9uID0gQ29TRUNvbnN0YW50cy5ERUZBVUxUX1VTRV9TTUFSVF9JREVBTF9FREdFX0xFTkdUSF9DQUxDVUxBVElPTjtcbiAgICB0aGlzLnNwcmluZ0NvbnN0YW50ID0gRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9TUFJJTkdfU1RSRU5HVEg7XG4gICAgdGhpcy5yZXB1bHNpb25Db25zdGFudCA9IEZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfUkVQVUxTSU9OX1NUUkVOR1RIO1xuICAgIHRoaXMuZ3Jhdml0eUNvbnN0YW50ID0gRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9HUkFWSVRZX1NUUkVOR1RIO1xuICAgIHRoaXMuY29tcG91bmRHcmF2aXR5Q29uc3RhbnQgPSBGRExheW91dENvbnN0YW50cy5ERUZBVUxUX0NPTVBPVU5EX0dSQVZJVFlfU1RSRU5HVEg7XG4gICAgdGhpcy5ncmF2aXR5UmFuZ2VGYWN0b3IgPSBGRExheW91dENvbnN0YW50cy5ERUZBVUxUX0dSQVZJVFlfUkFOR0VfRkFDVE9SO1xuICAgIHRoaXMuY29tcG91bmRHcmF2aXR5UmFuZ2VGYWN0b3IgPSBGRExheW91dENvbnN0YW50cy5ERUZBVUxUX0NPTVBPVU5EX0dSQVZJVFlfUkFOR0VfRkFDVE9SO1xuXG4gICAgLy8gdmFyaWFibGVzIGZvciB0cmVlIHJlZHVjdGlvbiBzdXBwb3J0XG4gICAgdGhpcy5wcnVuZWROb2Rlc0FsbCA9IFtdO1xuICAgIHRoaXMuZ3Jvd1RyZWVJdGVyYXRpb25zID0gMDtcbiAgICB0aGlzLmFmdGVyR3Jvd3RoSXRlcmF0aW9ucyA9IDA7XG4gICAgdGhpcy5pc1RyZWVHcm93aW5nID0gZmFsc2U7XG4gICAgdGhpcy5pc0dyb3d0aEZpbmlzaGVkID0gZmFsc2U7XG5cbiAgICAvLyB2YXJpYWJsZXMgZm9yIGNvb2xpbmdcbiAgICB0aGlzLmNvb2xpbmdDeWNsZSA9IDA7XG4gICAgdGhpcy5tYXhDb29saW5nQ3ljbGUgPSB0aGlzLm1heEl0ZXJhdGlvbnMgLyBGRExheW91dENvbnN0YW50cy5DT05WRVJHRU5DRV9DSEVDS19QRVJJT0Q7XG4gICAgdGhpcy5maW5hbFRlbXBlcmF0dXJlID0gRkRMYXlvdXRDb25zdGFudHMuQ09OVkVSR0VOQ0VfQ0hFQ0tfUEVSSU9EIC8gdGhpcy5tYXhJdGVyYXRpb25zO1xuICAgIHRoaXMuY29vbGluZ0FkanVzdGVyID0gMTtcbiAgfVxufTtcblxuQ29TRUxheW91dC5wcm90b3R5cGUubGF5b3V0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY3JlYXRlQmVuZHNBc05lZWRlZCA9IExheW91dENvbnN0YW50cy5ERUZBVUxUX0NSRUFURV9CRU5EU19BU19ORUVERUQ7XG4gIGlmIChjcmVhdGVCZW5kc0FzTmVlZGVkKSB7XG4gICAgdGhpcy5jcmVhdGVCZW5kcG9pbnRzKCk7XG4gICAgdGhpcy5ncmFwaE1hbmFnZXIucmVzZXRBbGxFZGdlcygpO1xuICB9XG5cbiAgdGhpcy5sZXZlbCA9IDA7XG4gIHJldHVybiB0aGlzLmNsYXNzaWNMYXlvdXQoKTtcbn07XG5cbkNvU0VMYXlvdXQucHJvdG90eXBlLmNsYXNzaWNMYXlvdXQgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMubm9kZXNXaXRoR3Jhdml0eSA9IHRoaXMuY2FsY3VsYXRlTm9kZXNUb0FwcGx5R3Jhdml0YXRpb25UbygpO1xuICB0aGlzLmdyYXBoTWFuYWdlci5zZXRBbGxOb2Rlc1RvQXBwbHlHcmF2aXRhdGlvbih0aGlzLm5vZGVzV2l0aEdyYXZpdHkpO1xuICB0aGlzLmNhbGNOb09mQ2hpbGRyZW5Gb3JBbGxOb2RlcygpO1xuICB0aGlzLmdyYXBoTWFuYWdlci5jYWxjTG93ZXN0Q29tbW9uQW5jZXN0b3JzKCk7XG4gIHRoaXMuZ3JhcGhNYW5hZ2VyLmNhbGNJbmNsdXNpb25UcmVlRGVwdGhzKCk7XG4gIHRoaXMuZ3JhcGhNYW5hZ2VyLmdldFJvb3QoKS5jYWxjRXN0aW1hdGVkU2l6ZSgpO1xuICB0aGlzLmNhbGNJZGVhbEVkZ2VMZW5ndGhzKCk7XG5cbiAgaWYgKCF0aGlzLmluY3JlbWVudGFsKSB7XG4gICAgdmFyIGZvcmVzdCA9IHRoaXMuZ2V0RmxhdEZvcmVzdCgpO1xuXG4gICAgLy8gVGhlIGdyYXBoIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGxheW91dCBpcyBmbGF0IGFuZCBhIGZvcmVzdFxuICAgIGlmIChmb3Jlc3QubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5wb3NpdGlvbk5vZGVzUmFkaWFsbHkoZm9yZXN0KTtcbiAgICB9XG4gICAgLy8gVGhlIGdyYXBoIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGxheW91dCBpcyBub3QgZmxhdCBvciBhIGZvcmVzdFxuICAgIGVsc2Uge1xuICAgICAgICAvLyBSZWR1Y2UgdGhlIHRyZWVzIHdoZW4gaW5jcmVtZW50YWwgbW9kZSBpcyBub3QgZW5hYmxlZCBhbmQgZ3JhcGggaXMgbm90IGEgZm9yZXN0IFxuICAgICAgICB0aGlzLnJlZHVjZVRyZWVzKCk7XG4gICAgICAgIC8vIFVwZGF0ZSBub2RlcyB0aGF0IGdyYXZpdHkgd2lsbCBiZSBhcHBsaWVkXG4gICAgICAgIHRoaXMuZ3JhcGhNYW5hZ2VyLnJlc2V0QWxsTm9kZXNUb0FwcGx5R3Jhdml0YXRpb24oKTtcbiAgICAgICAgdmFyIGFsbE5vZGVzID0gbmV3IFNldCh0aGlzLmdldEFsbE5vZGVzKCkpO1xuICAgICAgICB2YXIgaW50ZXJzZWN0aW9uID0gdGhpcy5ub2Rlc1dpdGhHcmF2aXR5LmZpbHRlcihmdW5jdGlvbiAoeCkge1xuICAgICAgICAgIHJldHVybiBhbGxOb2Rlcy5oYXMoeCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmdyYXBoTWFuYWdlci5zZXRBbGxOb2Rlc1RvQXBwbHlHcmF2aXRhdGlvbihpbnRlcnNlY3Rpb24pO1xuXG4gICAgICAgIHRoaXMucG9zaXRpb25Ob2Rlc1JhbmRvbWx5KCk7XG4gICAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKENvU0VDb25zdGFudHMuVFJFRV9SRURVQ1RJT05fT05fSU5DUkVNRU5UQUwpIHtcbiAgICAgIC8vIFJlZHVjZSB0aGUgdHJlZXMgaW4gaW5jcmVtZW50YWwgbW9kZSBpZiBvbmx5IHRoaXMgY29uc3RhbnQgaXMgc2V0IHRvIHRydWUgXG4gICAgICB0aGlzLnJlZHVjZVRyZWVzKCk7XG4gICAgICAvLyBVcGRhdGUgbm9kZXMgdGhhdCBncmF2aXR5IHdpbGwgYmUgYXBwbGllZFxuICAgICAgdGhpcy5ncmFwaE1hbmFnZXIucmVzZXRBbGxOb2Rlc1RvQXBwbHlHcmF2aXRhdGlvbigpO1xuICAgICAgdmFyIGFsbE5vZGVzID0gbmV3IFNldCh0aGlzLmdldEFsbE5vZGVzKCkpO1xuICAgICAgdmFyIGludGVyc2VjdGlvbiA9IHRoaXMubm9kZXNXaXRoR3Jhdml0eS5maWx0ZXIoZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgcmV0dXJuIGFsbE5vZGVzLmhhcyh4KTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5ncmFwaE1hbmFnZXIuc2V0QWxsTm9kZXNUb0FwcGx5R3Jhdml0YXRpb24oaW50ZXJzZWN0aW9uKTtcbiAgICB9XG4gIH1cblxuICB0aGlzLmluaXRTcHJpbmdFbWJlZGRlcigpO1xuICB0aGlzLnJ1blNwcmluZ0VtYmVkZGVyKCk7XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5Db1NFTGF5b3V0LnByb3RvdHlwZS50aWNrID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnRvdGFsSXRlcmF0aW9ucysrO1xuXG4gIGlmICh0aGlzLnRvdGFsSXRlcmF0aW9ucyA9PT0gdGhpcy5tYXhJdGVyYXRpb25zICYmICF0aGlzLmlzVHJlZUdyb3dpbmcgJiYgIXRoaXMuaXNHcm93dGhGaW5pc2hlZCkge1xuICAgIGlmICh0aGlzLnBydW5lZE5vZGVzQWxsLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuaXNUcmVlR3Jvd2luZyA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0aGlzLnRvdGFsSXRlcmF0aW9ucyAlIEZETGF5b3V0Q29uc3RhbnRzLkNPTlZFUkdFTkNFX0NIRUNLX1BFUklPRCA9PSAwICYmICF0aGlzLmlzVHJlZUdyb3dpbmcgJiYgIXRoaXMuaXNHcm93dGhGaW5pc2hlZCkge1xuICAgIGlmICh0aGlzLmlzQ29udmVyZ2VkKCkpIHtcbiAgICAgIGlmICh0aGlzLnBydW5lZE5vZGVzQWxsLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5pc1RyZWVHcm93aW5nID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuY29vbGluZ0N5Y2xlKys7XG5cbiAgICBpZiAodGhpcy5sYXlvdXRRdWFsaXR5ID09IDApIHtcbiAgICAgIC8vIHF1YWxpdHkgLSBcImRyYWZ0XCJcbiAgICAgIHRoaXMuY29vbGluZ0FkanVzdGVyID0gdGhpcy5jb29saW5nQ3ljbGU7XG4gICAgfSBlbHNlIGlmICh0aGlzLmxheW91dFF1YWxpdHkgPT0gMSkge1xuICAgICAgLy8gcXVhbGl0eSAtIFwiZGVmYXVsdFwiXG4gICAgICB0aGlzLmNvb2xpbmdBZGp1c3RlciA9IHRoaXMuY29vbGluZ0N5Y2xlIC8gMztcbiAgICB9XG5cbiAgICAvLyBjb29saW5nIHNjaGVkdWxlIGlzIGJhc2VkIG9uIGh0dHA6Ly93d3cuYnRsdWtlLmNvbS9zaW1hbmYxLmh0bWwgLT4gY29vbGluZyBzY2hlZHVsZSAzXG4gICAgdGhpcy5jb29saW5nRmFjdG9yID0gTWF0aC5tYXgodGhpcy5pbml0aWFsQ29vbGluZ0ZhY3RvciAtIE1hdGgucG93KHRoaXMuY29vbGluZ0N5Y2xlLCBNYXRoLmxvZygxMDAgKiAodGhpcy5pbml0aWFsQ29vbGluZ0ZhY3RvciAtIHRoaXMuZmluYWxUZW1wZXJhdHVyZSkpIC8gTWF0aC5sb2codGhpcy5tYXhDb29saW5nQ3ljbGUpKSAvIDEwMCAqIHRoaXMuY29vbGluZ0FkanVzdGVyLCB0aGlzLmZpbmFsVGVtcGVyYXR1cmUpO1xuICAgIHRoaXMuYW5pbWF0aW9uUGVyaW9kID0gTWF0aC5jZWlsKHRoaXMuaW5pdGlhbEFuaW1hdGlvblBlcmlvZCAqIE1hdGguc3FydCh0aGlzLmNvb2xpbmdGYWN0b3IpKTtcbiAgfVxuICAvLyBPcGVyYXRpb25zIHdoaWxlIHRyZWUgaXMgZ3Jvd2luZyBhZ2FpbiBcbiAgaWYgKHRoaXMuaXNUcmVlR3Jvd2luZykge1xuICAgIGlmICh0aGlzLmdyb3dUcmVlSXRlcmF0aW9ucyAlIDEwID09IDApIHtcbiAgICAgIGlmICh0aGlzLnBydW5lZE5vZGVzQWxsLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5ncmFwaE1hbmFnZXIudXBkYXRlQm91bmRzKCk7XG4gICAgICAgIHRoaXMudXBkYXRlR3JpZCgpO1xuICAgICAgICB0aGlzLmdyb3dUcmVlKHRoaXMucHJ1bmVkTm9kZXNBbGwpO1xuICAgICAgICAvLyBVcGRhdGUgbm9kZXMgdGhhdCBncmF2aXR5IHdpbGwgYmUgYXBwbGllZFxuICAgICAgICB0aGlzLmdyYXBoTWFuYWdlci5yZXNldEFsbE5vZGVzVG9BcHBseUdyYXZpdGF0aW9uKCk7XG4gICAgICAgIHZhciBhbGxOb2RlcyA9IG5ldyBTZXQodGhpcy5nZXRBbGxOb2RlcygpKTtcbiAgICAgICAgdmFyIGludGVyc2VjdGlvbiA9IHRoaXMubm9kZXNXaXRoR3Jhdml0eS5maWx0ZXIoZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICByZXR1cm4gYWxsTm9kZXMuaGFzKHgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ncmFwaE1hbmFnZXIuc2V0QWxsTm9kZXNUb0FwcGx5R3Jhdml0YXRpb24oaW50ZXJzZWN0aW9uKTtcblxuICAgICAgICB0aGlzLmdyYXBoTWFuYWdlci51cGRhdGVCb3VuZHMoKTtcbiAgICAgICAgdGhpcy51cGRhdGVHcmlkKCk7XG4gICAgICAgIHRoaXMuY29vbGluZ0ZhY3RvciA9IEZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfQ09PTElOR19GQUNUT1JfSU5DUkVNRU5UQUw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmlzVHJlZUdyb3dpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc0dyb3d0aEZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5ncm93VHJlZUl0ZXJhdGlvbnMrKztcbiAgfVxuICAvLyBPcGVyYXRpb25zIGFmdGVyIGdyb3d0aCBpcyBmaW5pc2hlZFxuICBpZiAodGhpcy5pc0dyb3d0aEZpbmlzaGVkKSB7XG4gICAgaWYgKHRoaXMuaXNDb252ZXJnZWQoKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmICh0aGlzLmFmdGVyR3Jvd3RoSXRlcmF0aW9ucyAlIDEwID09IDApIHtcbiAgICAgIHRoaXMuZ3JhcGhNYW5hZ2VyLnVwZGF0ZUJvdW5kcygpO1xuICAgICAgdGhpcy51cGRhdGVHcmlkKCk7XG4gICAgfVxuICAgIHRoaXMuY29vbGluZ0ZhY3RvciA9IEZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfQ09PTElOR19GQUNUT1JfSU5DUkVNRU5UQUwgKiAoKDEwMCAtIHRoaXMuYWZ0ZXJHcm93dGhJdGVyYXRpb25zKSAvIDEwMCk7XG4gICAgdGhpcy5hZnRlckdyb3d0aEl0ZXJhdGlvbnMrKztcbiAgfVxuXG4gIHZhciBncmlkVXBkYXRlQWxsb3dlZCA9ICF0aGlzLmlzVHJlZUdyb3dpbmcgJiYgIXRoaXMuaXNHcm93dGhGaW5pc2hlZDtcbiAgdmFyIGZvcmNlVG9Ob2RlU3Vycm91bmRpbmdVcGRhdGUgPSB0aGlzLmdyb3dUcmVlSXRlcmF0aW9ucyAlIDEwID09IDEgJiYgdGhpcy5pc1RyZWVHcm93aW5nIHx8IHRoaXMuYWZ0ZXJHcm93dGhJdGVyYXRpb25zICUgMTAgPT0gMSAmJiB0aGlzLmlzR3Jvd3RoRmluaXNoZWQ7XG5cbiAgdGhpcy50b3RhbERpc3BsYWNlbWVudCA9IDA7XG4gIHRoaXMuZ3JhcGhNYW5hZ2VyLnVwZGF0ZUJvdW5kcygpO1xuICB0aGlzLmNhbGNTcHJpbmdGb3JjZXMoKTtcbiAgdGhpcy5jYWxjUmVwdWxzaW9uRm9yY2VzKGdyaWRVcGRhdGVBbGxvd2VkLCBmb3JjZVRvTm9kZVN1cnJvdW5kaW5nVXBkYXRlKTtcbiAgdGhpcy5jYWxjR3Jhdml0YXRpb25hbEZvcmNlcygpO1xuICB0aGlzLm1vdmVOb2RlcygpO1xuICB0aGlzLmFuaW1hdGUoKTtcblxuICByZXR1cm4gZmFsc2U7IC8vIExheW91dCBpcyBub3QgZW5kZWQgeWV0IHJldHVybiBmYWxzZVxufTtcblxuQ29TRUxheW91dC5wcm90b3R5cGUuZ2V0UG9zaXRpb25zRGF0YSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGFsbE5vZGVzID0gdGhpcy5ncmFwaE1hbmFnZXIuZ2V0QWxsTm9kZXMoKTtcbiAgdmFyIHBEYXRhID0ge307XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYWxsTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcmVjdCA9IGFsbE5vZGVzW2ldLnJlY3Q7XG4gICAgdmFyIGlkID0gYWxsTm9kZXNbaV0uaWQ7XG4gICAgcERhdGFbaWRdID0ge1xuICAgICAgaWQ6IGlkLFxuICAgICAgeDogcmVjdC5nZXRDZW50ZXJYKCksXG4gICAgICB5OiByZWN0LmdldENlbnRlclkoKSxcbiAgICAgIHc6IHJlY3Qud2lkdGgsXG4gICAgICBoOiByZWN0LmhlaWdodFxuICAgIH07XG4gIH1cblxuICByZXR1cm4gcERhdGE7XG59O1xuXG5Db1NFTGF5b3V0LnByb3RvdHlwZS5ydW5TcHJpbmdFbWJlZGRlciA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5pbml0aWFsQW5pbWF0aW9uUGVyaW9kID0gMjU7XG4gIHRoaXMuYW5pbWF0aW9uUGVyaW9kID0gdGhpcy5pbml0aWFsQW5pbWF0aW9uUGVyaW9kO1xuICB2YXIgbGF5b3V0RW5kZWQgPSBmYWxzZTtcblxuICAvLyBJZiBhbWluYXRlIG9wdGlvbiBpcyAnZHVyaW5nJyBzaWduYWwgdGhhdCBsYXlvdXQgaXMgc3VwcG9zZWQgdG8gc3RhcnQgaXRlcmF0aW5nXG4gIGlmIChGRExheW91dENvbnN0YW50cy5BTklNQVRFID09PSAnZHVyaW5nJykge1xuICAgIHRoaXMuZW1pdCgnbGF5b3V0c3RhcnRlZCcpO1xuICB9IGVsc2Uge1xuICAgIC8vIElmIGFtaW5hdGUgb3B0aW9uIGlzICdkdXJpbmcnIHRpY2soKSBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCBvbiBpbmRleC5qc1xuICAgIHdoaWxlICghbGF5b3V0RW5kZWQpIHtcbiAgICAgIGxheW91dEVuZGVkID0gdGhpcy50aWNrKCk7XG4gICAgfVxuXG4gICAgdGhpcy5ncmFwaE1hbmFnZXIudXBkYXRlQm91bmRzKCk7XG4gIH1cbn07XG5cbkNvU0VMYXlvdXQucHJvdG90eXBlLmNhbGN1bGF0ZU5vZGVzVG9BcHBseUdyYXZpdGF0aW9uVG8gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBub2RlTGlzdCA9IFtdO1xuICB2YXIgZ3JhcGg7XG5cbiAgdmFyIGdyYXBocyA9IHRoaXMuZ3JhcGhNYW5hZ2VyLmdldEdyYXBocygpO1xuICB2YXIgc2l6ZSA9IGdyYXBocy5sZW5ndGg7XG4gIHZhciBpO1xuICBmb3IgKGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgZ3JhcGggPSBncmFwaHNbaV07XG5cbiAgICBncmFwaC51cGRhdGVDb25uZWN0ZWQoKTtcblxuICAgIGlmICghZ3JhcGguaXNDb25uZWN0ZWQpIHtcbiAgICAgIG5vZGVMaXN0ID0gbm9kZUxpc3QuY29uY2F0KGdyYXBoLmdldE5vZGVzKCkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBub2RlTGlzdDtcbn07XG5cbkNvU0VMYXlvdXQucHJvdG90eXBlLmNyZWF0ZUJlbmRwb2ludHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBlZGdlcyA9IFtdO1xuICBlZGdlcyA9IGVkZ2VzLmNvbmNhdCh0aGlzLmdyYXBoTWFuYWdlci5nZXRBbGxFZGdlcygpKTtcbiAgdmFyIHZpc2l0ZWQgPSBuZXcgU2V0KCk7XG4gIHZhciBpO1xuICBmb3IgKGkgPSAwOyBpIDwgZWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZWRnZSA9IGVkZ2VzW2ldO1xuXG4gICAgaWYgKCF2aXNpdGVkLmhhcyhlZGdlKSkge1xuICAgICAgdmFyIHNvdXJjZSA9IGVkZ2UuZ2V0U291cmNlKCk7XG4gICAgICB2YXIgdGFyZ2V0ID0gZWRnZS5nZXRUYXJnZXQoKTtcblxuICAgICAgaWYgKHNvdXJjZSA9PSB0YXJnZXQpIHtcbiAgICAgICAgZWRnZS5nZXRCZW5kcG9pbnRzKCkucHVzaChuZXcgUG9pbnREKCkpO1xuICAgICAgICBlZGdlLmdldEJlbmRwb2ludHMoKS5wdXNoKG5ldyBQb2ludEQoKSk7XG4gICAgICAgIHRoaXMuY3JlYXRlRHVtbXlOb2Rlc0ZvckJlbmRwb2ludHMoZWRnZSk7XG4gICAgICAgIHZpc2l0ZWQuYWRkKGVkZ2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGVkZ2VMaXN0ID0gW107XG5cbiAgICAgICAgZWRnZUxpc3QgPSBlZGdlTGlzdC5jb25jYXQoc291cmNlLmdldEVkZ2VMaXN0VG9Ob2RlKHRhcmdldCkpO1xuICAgICAgICBlZGdlTGlzdCA9IGVkZ2VMaXN0LmNvbmNhdCh0YXJnZXQuZ2V0RWRnZUxpc3RUb05vZGUoc291cmNlKSk7XG5cbiAgICAgICAgaWYgKCF2aXNpdGVkLmhhcyhlZGdlTGlzdFswXSkpIHtcbiAgICAgICAgICBpZiAoZWRnZUxpc3QubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgdmFyIGs7XG4gICAgICAgICAgICBmb3IgKGsgPSAwOyBrIDwgZWRnZUxpc3QubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgdmFyIG11bHRpRWRnZSA9IGVkZ2VMaXN0W2tdO1xuICAgICAgICAgICAgICBtdWx0aUVkZ2UuZ2V0QmVuZHBvaW50cygpLnB1c2gobmV3IFBvaW50RCgpKTtcbiAgICAgICAgICAgICAgdGhpcy5jcmVhdGVEdW1teU5vZGVzRm9yQmVuZHBvaW50cyhtdWx0aUVkZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBlZGdlTGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChlZGdlKSB7XG4gICAgICAgICAgICB2aXNpdGVkLmFkZChlZGdlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh2aXNpdGVkLnNpemUgPT0gZWRnZXMubGVuZ3RoKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbn07XG5cbkNvU0VMYXlvdXQucHJvdG90eXBlLnBvc2l0aW9uTm9kZXNSYWRpYWxseSA9IGZ1bmN0aW9uIChmb3Jlc3QpIHtcbiAgLy8gV2UgdGlsZSB0aGUgdHJlZXMgdG8gYSBncmlkIHJvdyBieSByb3c7IGZpcnN0IHRyZWUgc3RhcnRzIGF0ICgwLDApXG4gIHZhciBjdXJyZW50U3RhcnRpbmdQb2ludCA9IG5ldyBQb2ludCgwLCAwKTtcbiAgdmFyIG51bWJlck9mQ29sdW1ucyA9IE1hdGguY2VpbChNYXRoLnNxcnQoZm9yZXN0Lmxlbmd0aCkpO1xuICB2YXIgaGVpZ2h0ID0gMDtcbiAgdmFyIGN1cnJlbnRZID0gMDtcbiAgdmFyIGN1cnJlbnRYID0gMDtcbiAgdmFyIHBvaW50ID0gbmV3IFBvaW50RCgwLCAwKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGZvcmVzdC5sZW5ndGg7IGkrKykge1xuICAgIGlmIChpICUgbnVtYmVyT2ZDb2x1bW5zID09IDApIHtcbiAgICAgIC8vIFN0YXJ0IG9mIGEgbmV3IHJvdywgbWFrZSB0aGUgeCBjb29yZGluYXRlIDAsIGluY3JlbWVudCB0aGVcbiAgICAgIC8vIHkgY29vcmRpbmF0ZSB3aXRoIHRoZSBtYXggaGVpZ2h0IG9mIHRoZSBwcmV2aW91cyByb3dcbiAgICAgIGN1cnJlbnRYID0gMDtcbiAgICAgIGN1cnJlbnRZID0gaGVpZ2h0O1xuXG4gICAgICBpZiAoaSAhPSAwKSB7XG4gICAgICAgIGN1cnJlbnRZICs9IENvU0VDb25zdGFudHMuREVGQVVMVF9DT01QT05FTlRfU0VQRVJBVElPTjtcbiAgICAgIH1cblxuICAgICAgaGVpZ2h0ID0gMDtcbiAgICB9XG5cbiAgICB2YXIgdHJlZSA9IGZvcmVzdFtpXTtcblxuICAgIC8vIEZpbmQgdGhlIGNlbnRlciBvZiB0aGUgdHJlZVxuICAgIHZhciBjZW50ZXJOb2RlID0gTGF5b3V0LmZpbmRDZW50ZXJPZlRyZWUodHJlZSk7XG5cbiAgICAvLyBTZXQgdGhlIHN0YXJpbmcgcG9pbnQgb2YgdGhlIG5leHQgdHJlZVxuICAgIGN1cnJlbnRTdGFydGluZ1BvaW50LnggPSBjdXJyZW50WDtcbiAgICBjdXJyZW50U3RhcnRpbmdQb2ludC55ID0gY3VycmVudFk7XG5cbiAgICAvLyBEbyBhIHJhZGlhbCBsYXlvdXQgc3RhcnRpbmcgd2l0aCB0aGUgY2VudGVyXG4gICAgcG9pbnQgPSBDb1NFTGF5b3V0LnJhZGlhbExheW91dCh0cmVlLCBjZW50ZXJOb2RlLCBjdXJyZW50U3RhcnRpbmdQb2ludCk7XG5cbiAgICBpZiAocG9pbnQueSA+IGhlaWdodCkge1xuICAgICAgaGVpZ2h0ID0gTWF0aC5mbG9vcihwb2ludC55KTtcbiAgICB9XG5cbiAgICBjdXJyZW50WCA9IE1hdGguZmxvb3IocG9pbnQueCArIENvU0VDb25zdGFudHMuREVGQVVMVF9DT01QT05FTlRfU0VQRVJBVElPTik7XG4gIH1cblxuICB0aGlzLnRyYW5zZm9ybShuZXcgUG9pbnREKExheW91dENvbnN0YW50cy5XT1JMRF9DRU5URVJfWCAtIHBvaW50LnggLyAyLCBMYXlvdXRDb25zdGFudHMuV09STERfQ0VOVEVSX1kgLSBwb2ludC55IC8gMikpO1xufTtcblxuQ29TRUxheW91dC5yYWRpYWxMYXlvdXQgPSBmdW5jdGlvbiAodHJlZSwgY2VudGVyTm9kZSwgc3RhcnRpbmdQb2ludCkge1xuICB2YXIgcmFkaWFsU2VwID0gTWF0aC5tYXgodGhpcy5tYXhEaWFnb25hbEluVHJlZSh0cmVlKSwgQ29TRUNvbnN0YW50cy5ERUZBVUxUX1JBRElBTF9TRVBBUkFUSU9OKTtcbiAgQ29TRUxheW91dC5icmFuY2hSYWRpYWxMYXlvdXQoY2VudGVyTm9kZSwgbnVsbCwgMCwgMzU5LCAwLCByYWRpYWxTZXApO1xuICB2YXIgYm91bmRzID0gTEdyYXBoLmNhbGN1bGF0ZUJvdW5kcyh0cmVlKTtcblxuICB2YXIgdHJhbnNmb3JtID0gbmV3IFRyYW5zZm9ybSgpO1xuICB0cmFuc2Zvcm0uc2V0RGV2aWNlT3JnWChib3VuZHMuZ2V0TWluWCgpKTtcbiAgdHJhbnNmb3JtLnNldERldmljZU9yZ1koYm91bmRzLmdldE1pblkoKSk7XG4gIHRyYW5zZm9ybS5zZXRXb3JsZE9yZ1goc3RhcnRpbmdQb2ludC54KTtcbiAgdHJhbnNmb3JtLnNldFdvcmxkT3JnWShzdGFydGluZ1BvaW50LnkpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdHJlZS5sZW5ndGg7IGkrKykge1xuICAgIHZhciBub2RlID0gdHJlZVtpXTtcbiAgICBub2RlLnRyYW5zZm9ybSh0cmFuc2Zvcm0pO1xuICB9XG5cbiAgdmFyIGJvdHRvbVJpZ2h0ID0gbmV3IFBvaW50RChib3VuZHMuZ2V0TWF4WCgpLCBib3VuZHMuZ2V0TWF4WSgpKTtcblxuICByZXR1cm4gdHJhbnNmb3JtLmludmVyc2VUcmFuc2Zvcm1Qb2ludChib3R0b21SaWdodCk7XG59O1xuXG5Db1NFTGF5b3V0LmJyYW5jaFJhZGlhbExheW91dCA9IGZ1bmN0aW9uIChub2RlLCBwYXJlbnRPZk5vZGUsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBkaXN0YW5jZSwgcmFkaWFsU2VwYXJhdGlvbikge1xuICAvLyBGaXJzdCwgcG9zaXRpb24gdGhpcyBub2RlIGJ5IGZpbmRpbmcgaXRzIGFuZ2xlLlxuICB2YXIgaGFsZkludGVydmFsID0gKGVuZEFuZ2xlIC0gc3RhcnRBbmdsZSArIDEpIC8gMjtcblxuICBpZiAoaGFsZkludGVydmFsIDwgMCkge1xuICAgIGhhbGZJbnRlcnZhbCArPSAxODA7XG4gIH1cblxuICB2YXIgbm9kZUFuZ2xlID0gKGhhbGZJbnRlcnZhbCArIHN0YXJ0QW5nbGUpICUgMzYwO1xuICB2YXIgdGV0YSA9IG5vZGVBbmdsZSAqIElHZW9tZXRyeS5UV09fUEkgLyAzNjA7XG5cbiAgLy8gTWFrZSBwb2xhciB0byBqYXZhIGNvcmRpbmF0ZSBjb252ZXJzaW9uLlxuICB2YXIgY29zX3RldGEgPSBNYXRoLmNvcyh0ZXRhKTtcbiAgdmFyIHhfID0gZGlzdGFuY2UgKiBNYXRoLmNvcyh0ZXRhKTtcbiAgdmFyIHlfID0gZGlzdGFuY2UgKiBNYXRoLnNpbih0ZXRhKTtcblxuICBub2RlLnNldENlbnRlcih4XywgeV8pO1xuXG4gIC8vIFRyYXZlcnNlIGFsbCBuZWlnaGJvcnMgb2YgdGhpcyBub2RlIGFuZCByZWN1cnNpdmVseSBjYWxsIHRoaXNcbiAgLy8gZnVuY3Rpb24uXG4gIHZhciBuZWlnaGJvckVkZ2VzID0gW107XG4gIG5laWdoYm9yRWRnZXMgPSBuZWlnaGJvckVkZ2VzLmNvbmNhdChub2RlLmdldEVkZ2VzKCkpO1xuICB2YXIgY2hpbGRDb3VudCA9IG5laWdoYm9yRWRnZXMubGVuZ3RoO1xuXG4gIGlmIChwYXJlbnRPZk5vZGUgIT0gbnVsbCkge1xuICAgIGNoaWxkQ291bnQtLTtcbiAgfVxuXG4gIHZhciBicmFuY2hDb3VudCA9IDA7XG5cbiAgdmFyIGluY0VkZ2VzQ291bnQgPSBuZWlnaGJvckVkZ2VzLmxlbmd0aDtcbiAgdmFyIHN0YXJ0SW5kZXg7XG5cbiAgdmFyIGVkZ2VzID0gbm9kZS5nZXRFZGdlc0JldHdlZW4ocGFyZW50T2ZOb2RlKTtcblxuICAvLyBJZiB0aGVyZSBhcmUgbXVsdGlwbGUgZWRnZXMsIHBydW5lIHRoZW0gdW50aWwgdGhlcmUgcmVtYWlucyBvbmx5IG9uZVxuICAvLyBlZGdlLlxuICB3aGlsZSAoZWRnZXMubGVuZ3RoID4gMSkge1xuICAgIC8vbmVpZ2hib3JFZGdlcy5yZW1vdmUoZWRnZXMucmVtb3ZlKDApKTtcbiAgICB2YXIgdGVtcCA9IGVkZ2VzWzBdO1xuICAgIGVkZ2VzLnNwbGljZSgwLCAxKTtcbiAgICB2YXIgaW5kZXggPSBuZWlnaGJvckVkZ2VzLmluZGV4T2YodGVtcCk7XG4gICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgIG5laWdoYm9yRWRnZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gICAgaW5jRWRnZXNDb3VudC0tO1xuICAgIGNoaWxkQ291bnQtLTtcbiAgfVxuXG4gIGlmIChwYXJlbnRPZk5vZGUgIT0gbnVsbCkge1xuICAgIC8vYXNzZXJ0IGVkZ2VzLmxlbmd0aCA9PSAxO1xuICAgIHN0YXJ0SW5kZXggPSAobmVpZ2hib3JFZGdlcy5pbmRleE9mKGVkZ2VzWzBdKSArIDEpICUgaW5jRWRnZXNDb3VudDtcbiAgfSBlbHNlIHtcbiAgICBzdGFydEluZGV4ID0gMDtcbiAgfVxuXG4gIHZhciBzdGVwQW5nbGUgPSBNYXRoLmFicyhlbmRBbmdsZSAtIHN0YXJ0QW5nbGUpIC8gY2hpbGRDb3VudDtcblxuICBmb3IgKHZhciBpID0gc3RhcnRJbmRleDsgYnJhbmNoQ291bnQgIT0gY2hpbGRDb3VudDsgaSA9ICsraSAlIGluY0VkZ2VzQ291bnQpIHtcbiAgICB2YXIgY3VycmVudE5laWdoYm9yID0gbmVpZ2hib3JFZGdlc1tpXS5nZXRPdGhlckVuZChub2RlKTtcblxuICAgIC8vIERvbid0IGJhY2sgdHJhdmVyc2UgdG8gcm9vdCBub2RlIGluIGN1cnJlbnQgdHJlZS5cbiAgICBpZiAoY3VycmVudE5laWdoYm9yID09IHBhcmVudE9mTm9kZSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgdmFyIGNoaWxkU3RhcnRBbmdsZSA9IChzdGFydEFuZ2xlICsgYnJhbmNoQ291bnQgKiBzdGVwQW5nbGUpICUgMzYwO1xuICAgIHZhciBjaGlsZEVuZEFuZ2xlID0gKGNoaWxkU3RhcnRBbmdsZSArIHN0ZXBBbmdsZSkgJSAzNjA7XG5cbiAgICBDb1NFTGF5b3V0LmJyYW5jaFJhZGlhbExheW91dChjdXJyZW50TmVpZ2hib3IsIG5vZGUsIGNoaWxkU3RhcnRBbmdsZSwgY2hpbGRFbmRBbmdsZSwgZGlzdGFuY2UgKyByYWRpYWxTZXBhcmF0aW9uLCByYWRpYWxTZXBhcmF0aW9uKTtcblxuICAgIGJyYW5jaENvdW50Kys7XG4gIH1cbn07XG5cbkNvU0VMYXlvdXQubWF4RGlhZ29uYWxJblRyZWUgPSBmdW5jdGlvbiAodHJlZSkge1xuICB2YXIgbWF4RGlhZ29uYWwgPSBJbnRlZ2VyLk1JTl9WQUxVRTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRyZWUubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgbm9kZSA9IHRyZWVbaV07XG4gICAgdmFyIGRpYWdvbmFsID0gbm9kZS5nZXREaWFnb25hbCgpO1xuXG4gICAgaWYgKGRpYWdvbmFsID4gbWF4RGlhZ29uYWwpIHtcbiAgICAgIG1heERpYWdvbmFsID0gZGlhZ29uYWw7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1heERpYWdvbmFsO1xufTtcblxuQ29TRUxheW91dC5wcm90b3R5cGUuY2FsY1JlcHVsc2lvblJhbmdlID0gZnVuY3Rpb24gKCkge1xuICAvLyBmb3JtdWxhIGlzIDIgeCAobGV2ZWwgKyAxKSB4IGlkZWFsRWRnZUxlbmd0aFxuICByZXR1cm4gMiAqICh0aGlzLmxldmVsICsgMSkgKiB0aGlzLmlkZWFsRWRnZUxlbmd0aDtcbn07XG5cbi8vIFRpbGluZyBtZXRob2RzXG5cbi8vIEdyb3VwIHplcm8gZGVncmVlIG1lbWJlcnMgd2hvc2UgcGFyZW50cyBhcmUgbm90IHRvIGJlIHRpbGVkLCBjcmVhdGUgZHVtbXkgcGFyZW50cyB3aGVyZSBuZWVkZWQgYW5kIGZpbGwgbWVtYmVyR3JvdXBzIGJ5IHRoZWlyIGR1bW1wIHBhcmVudCBpZCdzXG5Db1NFTGF5b3V0LnByb3RvdHlwZS5ncm91cFplcm9EZWdyZWVNZW1iZXJzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIC8vIGFycmF5IG9mIFtwYXJlbnRfaWQgeCBvbmVEZWdyZWVOb2RlX2lkXVxuICB2YXIgdGVtcE1lbWJlckdyb3VwcyA9IHt9OyAvLyBBIHRlbXBvcmFyeSBtYXAgb2YgcGFyZW50IG5vZGUgYW5kIGl0cyB6ZXJvIGRlZ3JlZSBtZW1iZXJzXG4gIHRoaXMubWVtYmVyR3JvdXBzID0ge307IC8vIEEgbWFwIG9mIGR1bW15IHBhcmVudCBub2RlIGFuZCBpdHMgemVybyBkZWdyZWUgbWVtYmVycyB3aG9zZSBwYXJlbnRzIGFyZSBub3QgdG8gYmUgdGlsZWRcbiAgdGhpcy5pZFRvRHVtbXlOb2RlID0ge307IC8vIEEgbWFwIG9mIGlkIHRvIGR1bW15IG5vZGUgXG5cbiAgdmFyIHplcm9EZWdyZWUgPSBbXTsgLy8gTGlzdCBvZiB6ZXJvIGRlZ3JlZSBub2RlcyB3aG9zZSBwYXJlbnRzIGFyZSBub3QgdG8gYmUgdGlsZWRcbiAgdmFyIGFsbE5vZGVzID0gdGhpcy5ncmFwaE1hbmFnZXIuZ2V0QWxsTm9kZXMoKTtcblxuICAvLyBGaWxsIHplcm8gZGVncmVlIGxpc3RcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbGxOb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBub2RlID0gYWxsTm9kZXNbaV07XG4gICAgdmFyIHBhcmVudCA9IG5vZGUuZ2V0UGFyZW50KCk7XG4gICAgLy8gSWYgYSBub2RlIGhhcyB6ZXJvIGRlZ3JlZSBhbmQgaXRzIHBhcmVudCBpcyBub3QgdG8gYmUgdGlsZWQgaWYgZXhpc3RzIGFkZCB0aGF0IG5vZGUgdG8gemVyb0RlZ3JlcyBsaXN0XG4gICAgaWYgKHRoaXMuZ2V0Tm9kZURlZ3JlZVdpdGhDaGlsZHJlbihub2RlKSA9PT0gMCAmJiAocGFyZW50LmlkID09IHVuZGVmaW5lZCB8fCAhdGhpcy5nZXRUb0JlVGlsZWQocGFyZW50KSkpIHtcbiAgICAgIHplcm9EZWdyZWUucHVzaChub2RlKTtcbiAgICB9XG4gIH1cblxuICAvLyBDcmVhdGUgYSBtYXAgb2YgcGFyZW50IG5vZGUgYW5kIGl0cyB6ZXJvIGRlZ3JlZSBtZW1iZXJzXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgemVyb0RlZ3JlZS5sZW5ndGg7IGkrKykge1xuICAgIHZhciBub2RlID0gemVyb0RlZ3JlZVtpXTsgLy8gWmVybyBkZWdyZWUgbm9kZSBpdHNlbGZcbiAgICB2YXIgcF9pZCA9IG5vZGUuZ2V0UGFyZW50KCkuaWQ7IC8vIFBhcmVudCBpZFxuXG4gICAgaWYgKHR5cGVvZiB0ZW1wTWVtYmVyR3JvdXBzW3BfaWRdID09PSBcInVuZGVmaW5lZFwiKSB0ZW1wTWVtYmVyR3JvdXBzW3BfaWRdID0gW107XG5cbiAgICB0ZW1wTWVtYmVyR3JvdXBzW3BfaWRdID0gdGVtcE1lbWJlckdyb3Vwc1twX2lkXS5jb25jYXQobm9kZSk7IC8vIFB1c2ggbm9kZSB0byB0aGUgbGlzdCBiZWxvbmdzIHRvIGl0cyBwYXJlbnQgaW4gdGVtcE1lbWJlckdyb3Vwc1xuICB9XG5cbiAgLy8gSWYgdGhlcmUgYXJlIGF0IGxlYXN0IHR3byBub2RlcyBhdCBhIGxldmVsLCBjcmVhdGUgYSBkdW1teSBjb21wb3VuZCBmb3IgdGhlbVxuICBPYmplY3Qua2V5cyh0ZW1wTWVtYmVyR3JvdXBzKS5mb3JFYWNoKGZ1bmN0aW9uIChwX2lkKSB7XG4gICAgaWYgKHRlbXBNZW1iZXJHcm91cHNbcF9pZF0ubGVuZ3RoID4gMSkge1xuICAgICAgdmFyIGR1bW15Q29tcG91bmRJZCA9IFwiRHVtbXlDb21wb3VuZF9cIiArIHBfaWQ7IC8vIFRoZSBpZCBvZiBkdW1teSBjb21wb3VuZCB3aGljaCB3aWxsIGJlIGNyZWF0ZWQgc29vblxuICAgICAgc2VsZi5tZW1iZXJHcm91cHNbZHVtbXlDb21wb3VuZElkXSA9IHRlbXBNZW1iZXJHcm91cHNbcF9pZF07IC8vIEFkZCBkdW1teSBjb21wb3VuZCB0byBtZW1iZXJHcm91cHNcblxuICAgICAgdmFyIHBhcmVudCA9IHRlbXBNZW1iZXJHcm91cHNbcF9pZF1bMF0uZ2V0UGFyZW50KCk7IC8vIFRoZSBwYXJlbnQgb2YgemVybyBkZWdyZWUgbm9kZXMgd2lsbCBiZSB0aGUgcGFyZW50IG9mIG5ldyBkdW1teSBjb21wb3VuZFxuXG4gICAgICAvLyBDcmVhdGUgYSBkdW1teSBjb21wb3VuZCB3aXRoIGNhbGN1bGF0ZWQgaWRcbiAgICAgIHZhciBkdW1teUNvbXBvdW5kID0gbmV3IENvU0VOb2RlKHNlbGYuZ3JhcGhNYW5hZ2VyKTtcbiAgICAgIGR1bW15Q29tcG91bmQuaWQgPSBkdW1teUNvbXBvdW5kSWQ7XG4gICAgICBkdW1teUNvbXBvdW5kLnBhZGRpbmdMZWZ0ID0gcGFyZW50LnBhZGRpbmdMZWZ0IHx8IDA7XG4gICAgICBkdW1teUNvbXBvdW5kLnBhZGRpbmdSaWdodCA9IHBhcmVudC5wYWRkaW5nUmlnaHQgfHwgMDtcbiAgICAgIGR1bW15Q29tcG91bmQucGFkZGluZ0JvdHRvbSA9IHBhcmVudC5wYWRkaW5nQm90dG9tIHx8IDA7XG4gICAgICBkdW1teUNvbXBvdW5kLnBhZGRpbmdUb3AgPSBwYXJlbnQucGFkZGluZ1RvcCB8fCAwO1xuXG4gICAgICBzZWxmLmlkVG9EdW1teU5vZGVbZHVtbXlDb21wb3VuZElkXSA9IGR1bW15Q29tcG91bmQ7XG5cbiAgICAgIHZhciBkdW1teVBhcmVudEdyYXBoID0gc2VsZi5nZXRHcmFwaE1hbmFnZXIoKS5hZGQoc2VsZi5uZXdHcmFwaCgpLCBkdW1teUNvbXBvdW5kKTtcbiAgICAgIHZhciBwYXJlbnRHcmFwaCA9IHBhcmVudC5nZXRDaGlsZCgpO1xuXG4gICAgICAvLyBBZGQgZHVtbXkgY29tcG91bmQgdG8gcGFyZW50IHRoZSBncmFwaFxuICAgICAgcGFyZW50R3JhcGguYWRkKGR1bW15Q29tcG91bmQpO1xuXG4gICAgICAvLyBGb3IgZWFjaCB6ZXJvIGRlZ3JlZSBub2RlIGluIHRoaXMgbGV2ZWwgcmVtb3ZlIGl0IGZyb20gaXRzIHBhcmVudCBncmFwaCBhbmQgYWRkIGl0IHRvIHRoZSBncmFwaCBvZiBkdW1teSBwYXJlbnRcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGVtcE1lbWJlckdyb3Vwc1twX2lkXS5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbm9kZSA9IHRlbXBNZW1iZXJHcm91cHNbcF9pZF1baV07XG5cbiAgICAgICAgcGFyZW50R3JhcGgucmVtb3ZlKG5vZGUpO1xuICAgICAgICBkdW1teVBhcmVudEdyYXBoLmFkZChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufTtcblxuQ29TRUxheW91dC5wcm90b3R5cGUuY2xlYXJDb21wb3VuZHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjaGlsZEdyYXBoTWFwID0ge307XG4gIHZhciBpZFRvTm9kZSA9IHt9O1xuXG4gIC8vIEdldCBjb21wb3VuZCBvcmRlcmluZyBieSBmaW5kaW5nIHRoZSBpbm5lciBvbmUgZmlyc3RcbiAgdGhpcy5wZXJmb3JtREZTT25Db21wb3VuZHMoKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29tcG91bmRPcmRlci5sZW5ndGg7IGkrKykge1xuXG4gICAgaWRUb05vZGVbdGhpcy5jb21wb3VuZE9yZGVyW2ldLmlkXSA9IHRoaXMuY29tcG91bmRPcmRlcltpXTtcbiAgICBjaGlsZEdyYXBoTWFwW3RoaXMuY29tcG91bmRPcmRlcltpXS5pZF0gPSBbXS5jb25jYXQodGhpcy5jb21wb3VuZE9yZGVyW2ldLmdldENoaWxkKCkuZ2V0Tm9kZXMoKSk7XG5cbiAgICAvLyBSZW1vdmUgY2hpbGRyZW4gb2YgY29tcG91bmRzXG4gICAgdGhpcy5ncmFwaE1hbmFnZXIucmVtb3ZlKHRoaXMuY29tcG91bmRPcmRlcltpXS5nZXRDaGlsZCgpKTtcbiAgICB0aGlzLmNvbXBvdW5kT3JkZXJbaV0uY2hpbGQgPSBudWxsO1xuICB9XG5cbiAgdGhpcy5ncmFwaE1hbmFnZXIucmVzZXRBbGxOb2RlcygpO1xuXG4gIC8vIFRpbGUgdGhlIHJlbW92ZWQgY2hpbGRyZW5cbiAgdGhpcy50aWxlQ29tcG91bmRNZW1iZXJzKGNoaWxkR3JhcGhNYXAsIGlkVG9Ob2RlKTtcbn07XG5cbkNvU0VMYXlvdXQucHJvdG90eXBlLmNsZWFyWmVyb0RlZ3JlZU1lbWJlcnMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIHRpbGVkWmVyb0RlZ3JlZVBhY2sgPSB0aGlzLnRpbGVkWmVyb0RlZ3JlZVBhY2sgPSBbXTtcblxuICBPYmplY3Qua2V5cyh0aGlzLm1lbWJlckdyb3VwcykuZm9yRWFjaChmdW5jdGlvbiAoaWQpIHtcbiAgICB2YXIgY29tcG91bmROb2RlID0gc2VsZi5pZFRvRHVtbXlOb2RlW2lkXTsgLy8gR2V0IHRoZSBkdW1teSBjb21wb3VuZFxuXG4gICAgdGlsZWRaZXJvRGVncmVlUGFja1tpZF0gPSBzZWxmLnRpbGVOb2RlcyhzZWxmLm1lbWJlckdyb3Vwc1tpZF0sIGNvbXBvdW5kTm9kZS5wYWRkaW5nTGVmdCArIGNvbXBvdW5kTm9kZS5wYWRkaW5nUmlnaHQpO1xuXG4gICAgLy8gU2V0IHRoZSB3aWR0aCBhbmQgaGVpZ2h0IG9mIHRoZSBkdW1teSBjb21wb3VuZCBhcyBjYWxjdWxhdGVkXG4gICAgY29tcG91bmROb2RlLnJlY3Qud2lkdGggPSB0aWxlZFplcm9EZWdyZWVQYWNrW2lkXS53aWR0aDtcbiAgICBjb21wb3VuZE5vZGUucmVjdC5oZWlnaHQgPSB0aWxlZFplcm9EZWdyZWVQYWNrW2lkXS5oZWlnaHQ7XG4gIH0pO1xufTtcblxuQ29TRUxheW91dC5wcm90b3R5cGUucmVwb3B1bGF0ZUNvbXBvdW5kcyA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yICh2YXIgaSA9IHRoaXMuY29tcG91bmRPcmRlci5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIHZhciBsQ29tcG91bmROb2RlID0gdGhpcy5jb21wb3VuZE9yZGVyW2ldO1xuICAgIHZhciBpZCA9IGxDb21wb3VuZE5vZGUuaWQ7XG4gICAgdmFyIGhvcml6b250YWxNYXJnaW4gPSBsQ29tcG91bmROb2RlLnBhZGRpbmdMZWZ0O1xuICAgIHZhciB2ZXJ0aWNhbE1hcmdpbiA9IGxDb21wb3VuZE5vZGUucGFkZGluZ1RvcDtcblxuICAgIHRoaXMuYWRqdXN0TG9jYXRpb25zKHRoaXMudGlsZWRNZW1iZXJQYWNrW2lkXSwgbENvbXBvdW5kTm9kZS5yZWN0LngsIGxDb21wb3VuZE5vZGUucmVjdC55LCBob3Jpem9udGFsTWFyZ2luLCB2ZXJ0aWNhbE1hcmdpbik7XG4gIH1cbn07XG5cbkNvU0VMYXlvdXQucHJvdG90eXBlLnJlcG9wdWxhdGVaZXJvRGVncmVlTWVtYmVycyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgdGlsZWRQYWNrID0gdGhpcy50aWxlZFplcm9EZWdyZWVQYWNrO1xuXG4gIE9iamVjdC5rZXlzKHRpbGVkUGFjaykuZm9yRWFjaChmdW5jdGlvbiAoaWQpIHtcbiAgICB2YXIgY29tcG91bmROb2RlID0gc2VsZi5pZFRvRHVtbXlOb2RlW2lkXTsgLy8gR2V0IHRoZSBkdW1teSBjb21wb3VuZCBieSBpdHMgaWRcbiAgICB2YXIgaG9yaXpvbnRhbE1hcmdpbiA9IGNvbXBvdW5kTm9kZS5wYWRkaW5nTGVmdDtcbiAgICB2YXIgdmVydGljYWxNYXJnaW4gPSBjb21wb3VuZE5vZGUucGFkZGluZ1RvcDtcblxuICAgIC8vIEFkanVzdCB0aGUgcG9zaXRpb25zIG9mIG5vZGVzIHdydCBpdHMgY29tcG91bmRcbiAgICBzZWxmLmFkanVzdExvY2F0aW9ucyh0aWxlZFBhY2tbaWRdLCBjb21wb3VuZE5vZGUucmVjdC54LCBjb21wb3VuZE5vZGUucmVjdC55LCBob3Jpem9udGFsTWFyZ2luLCB2ZXJ0aWNhbE1hcmdpbik7XG4gIH0pO1xufTtcblxuQ29TRUxheW91dC5wcm90b3R5cGUuZ2V0VG9CZVRpbGVkID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgdmFyIGlkID0gbm9kZS5pZDtcbiAgLy9maXJzdGx5IGNoZWNrIHRoZSBwcmV2aW91cyByZXN1bHRzXG4gIGlmICh0aGlzLnRvQmVUaWxlZFtpZF0gIT0gbnVsbCkge1xuICAgIHJldHVybiB0aGlzLnRvQmVUaWxlZFtpZF07XG4gIH1cblxuICAvL29ubHkgY29tcG91bmQgbm9kZXMgYXJlIHRvIGJlIHRpbGVkXG4gIHZhciBjaGlsZEdyYXBoID0gbm9kZS5nZXRDaGlsZCgpO1xuICBpZiAoY2hpbGRHcmFwaCA9PSBudWxsKSB7XG4gICAgdGhpcy50b0JlVGlsZWRbaWRdID0gZmFsc2U7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIGNoaWxkcmVuID0gY2hpbGRHcmFwaC5nZXROb2RlcygpOyAvLyBHZXQgdGhlIGNoaWxkcmVuIG5vZGVzXG5cbiAgLy9hIGNvbXBvdW5kIG5vZGUgaXMgbm90IHRvIGJlIHRpbGVkIGlmIGFsbCBvZiBpdHMgY29tcG91bmQgY2hpbGRyZW4gYXJlIG5vdCB0byBiZSB0aWxlZFxuICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHRoZUNoaWxkID0gY2hpbGRyZW5baV07XG5cbiAgICBpZiAodGhpcy5nZXROb2RlRGVncmVlKHRoZUNoaWxkKSA+IDApIHtcbiAgICAgIHRoaXMudG9CZVRpbGVkW2lkXSA9IGZhbHNlO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vcGFzcyB0aGUgY2hpbGRyZW4gbm90IGhhdmluZyB0aGUgY29tcG91bmQgc3RydWN0dXJlXG4gICAgaWYgKHRoZUNoaWxkLmdldENoaWxkKCkgPT0gbnVsbCkge1xuICAgICAgdGhpcy50b0JlVGlsZWRbdGhlQ2hpbGQuaWRdID0gZmFsc2U7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuZ2V0VG9CZVRpbGVkKHRoZUNoaWxkKSkge1xuICAgICAgdGhpcy50b0JlVGlsZWRbaWRdID0gZmFsc2U7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHRoaXMudG9CZVRpbGVkW2lkXSA9IHRydWU7XG4gIHJldHVybiB0cnVlO1xufTtcblxuLy8gR2V0IGRlZ3JlZSBvZiBhIG5vZGUgZGVwZW5kaW5nIG9mIGl0cyBlZGdlcyBhbmQgaW5kZXBlbmRlbnQgb2YgaXRzIGNoaWxkcmVuXG5Db1NFTGF5b3V0LnByb3RvdHlwZS5nZXROb2RlRGVncmVlID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgdmFyIGlkID0gbm9kZS5pZDtcbiAgdmFyIGVkZ2VzID0gbm9kZS5nZXRFZGdlcygpO1xuICB2YXIgZGVncmVlID0gMDtcblxuICAvLyBGb3IgdGhlIGVkZ2VzIGNvbm5lY3RlZFxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGVkZ2UgPSBlZGdlc1tpXTtcbiAgICBpZiAoZWRnZS5nZXRTb3VyY2UoKS5pZCAhPT0gZWRnZS5nZXRUYXJnZXQoKS5pZCkge1xuICAgICAgZGVncmVlID0gZGVncmVlICsgMTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlZ3JlZTtcbn07XG5cbi8vIEdldCBkZWdyZWUgb2YgYSBub2RlIHdpdGggaXRzIGNoaWxkcmVuXG5Db1NFTGF5b3V0LnByb3RvdHlwZS5nZXROb2RlRGVncmVlV2l0aENoaWxkcmVuID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgdmFyIGRlZ3JlZSA9IHRoaXMuZ2V0Tm9kZURlZ3JlZShub2RlKTtcbiAgaWYgKG5vZGUuZ2V0Q2hpbGQoKSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIGRlZ3JlZTtcbiAgfVxuICB2YXIgY2hpbGRyZW4gPSBub2RlLmdldENoaWxkKCkuZ2V0Tm9kZXMoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuICAgIGRlZ3JlZSArPSB0aGlzLmdldE5vZGVEZWdyZWVXaXRoQ2hpbGRyZW4oY2hpbGQpO1xuICB9XG4gIHJldHVybiBkZWdyZWU7XG59O1xuXG5Db1NFTGF5b3V0LnByb3RvdHlwZS5wZXJmb3JtREZTT25Db21wb3VuZHMgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuY29tcG91bmRPcmRlciA9IFtdO1xuICB0aGlzLmZpbGxDb21wZXhPcmRlckJ5REZTKHRoaXMuZ3JhcGhNYW5hZ2VyLmdldFJvb3QoKS5nZXROb2RlcygpKTtcbn07XG5cbkNvU0VMYXlvdXQucHJvdG90eXBlLmZpbGxDb21wZXhPcmRlckJ5REZTID0gZnVuY3Rpb24gKGNoaWxkcmVuKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICBpZiAoY2hpbGQuZ2V0Q2hpbGQoKSAhPSBudWxsKSB7XG4gICAgICB0aGlzLmZpbGxDb21wZXhPcmRlckJ5REZTKGNoaWxkLmdldENoaWxkKCkuZ2V0Tm9kZXMoKSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmdldFRvQmVUaWxlZChjaGlsZCkpIHtcbiAgICAgIHRoaXMuY29tcG91bmRPcmRlci5wdXNoKGNoaWxkKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuKiBUaGlzIG1ldGhvZCBwbGFjZXMgZWFjaCB6ZXJvIGRlZ3JlZSBtZW1iZXIgd3J0IGdpdmVuICh4LHkpIGNvb3JkaW5hdGVzICh0b3AgbGVmdCkuXG4qL1xuQ29TRUxheW91dC5wcm90b3R5cGUuYWRqdXN0TG9jYXRpb25zID0gZnVuY3Rpb24gKG9yZ2FuaXphdGlvbiwgeCwgeSwgY29tcG91bmRIb3Jpem9udGFsTWFyZ2luLCBjb21wb3VuZFZlcnRpY2FsTWFyZ2luKSB7XG4gIHggKz0gY29tcG91bmRIb3Jpem9udGFsTWFyZ2luO1xuICB5ICs9IGNvbXBvdW5kVmVydGljYWxNYXJnaW47XG5cbiAgdmFyIGxlZnQgPSB4O1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgb3JnYW5pemF0aW9uLnJvd3MubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcm93ID0gb3JnYW5pemF0aW9uLnJvd3NbaV07XG4gICAgeCA9IGxlZnQ7XG4gICAgdmFyIG1heEhlaWdodCA9IDA7XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJvdy5sZW5ndGg7IGorKykge1xuICAgICAgdmFyIGxub2RlID0gcm93W2pdO1xuXG4gICAgICBsbm9kZS5yZWN0LnggPSB4OyAvLyArIGxub2RlLnJlY3Qud2lkdGggLyAyO1xuICAgICAgbG5vZGUucmVjdC55ID0geTsgLy8gKyBsbm9kZS5yZWN0LmhlaWdodCAvIDI7XG5cbiAgICAgIHggKz0gbG5vZGUucmVjdC53aWR0aCArIG9yZ2FuaXphdGlvbi5ob3Jpem9udGFsUGFkZGluZztcblxuICAgICAgaWYgKGxub2RlLnJlY3QuaGVpZ2h0ID4gbWF4SGVpZ2h0KSBtYXhIZWlnaHQgPSBsbm9kZS5yZWN0LmhlaWdodDtcbiAgICB9XG5cbiAgICB5ICs9IG1heEhlaWdodCArIG9yZ2FuaXphdGlvbi52ZXJ0aWNhbFBhZGRpbmc7XG4gIH1cbn07XG5cbkNvU0VMYXlvdXQucHJvdG90eXBlLnRpbGVDb21wb3VuZE1lbWJlcnMgPSBmdW5jdGlvbiAoY2hpbGRHcmFwaE1hcCwgaWRUb05vZGUpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLnRpbGVkTWVtYmVyUGFjayA9IFtdO1xuXG4gIE9iamVjdC5rZXlzKGNoaWxkR3JhcGhNYXApLmZvckVhY2goZnVuY3Rpb24gKGlkKSB7XG4gICAgLy8gR2V0IHRoZSBjb21wb3VuZCBub2RlXG4gICAgdmFyIGNvbXBvdW5kTm9kZSA9IGlkVG9Ob2RlW2lkXTtcblxuICAgIHNlbGYudGlsZWRNZW1iZXJQYWNrW2lkXSA9IHNlbGYudGlsZU5vZGVzKGNoaWxkR3JhcGhNYXBbaWRdLCBjb21wb3VuZE5vZGUucGFkZGluZ0xlZnQgKyBjb21wb3VuZE5vZGUucGFkZGluZ1JpZ2h0KTtcblxuICAgIGNvbXBvdW5kTm9kZS5yZWN0LndpZHRoID0gc2VsZi50aWxlZE1lbWJlclBhY2tbaWRdLndpZHRoO1xuICAgIGNvbXBvdW5kTm9kZS5yZWN0LmhlaWdodCA9IHNlbGYudGlsZWRNZW1iZXJQYWNrW2lkXS5oZWlnaHQ7XG4gIH0pO1xufTtcblxuQ29TRUxheW91dC5wcm90b3R5cGUudGlsZU5vZGVzID0gZnVuY3Rpb24gKG5vZGVzLCBtaW5XaWR0aCkge1xuICB2YXIgdmVydGljYWxQYWRkaW5nID0gQ29TRUNvbnN0YW50cy5USUxJTkdfUEFERElOR19WRVJUSUNBTDtcbiAgdmFyIGhvcml6b250YWxQYWRkaW5nID0gQ29TRUNvbnN0YW50cy5USUxJTkdfUEFERElOR19IT1JJWk9OVEFMO1xuICB2YXIgb3JnYW5pemF0aW9uID0ge1xuICAgIHJvd3M6IFtdLFxuICAgIHJvd1dpZHRoOiBbXSxcbiAgICByb3dIZWlnaHQ6IFtdLFxuICAgIHdpZHRoOiAwLFxuICAgIGhlaWdodDogbWluV2lkdGgsIC8vIGFzc3VtZSBtaW5IZWlnaHQgZXF1YWxzIHRvIG1pbldpZHRoXG4gICAgdmVydGljYWxQYWRkaW5nOiB2ZXJ0aWNhbFBhZGRpbmcsXG4gICAgaG9yaXpvbnRhbFBhZGRpbmc6IGhvcml6b250YWxQYWRkaW5nXG4gIH07XG5cbiAgLy8gU29ydCB0aGUgbm9kZXMgaW4gYXNjZW5kaW5nIG9yZGVyIG9mIHRoZWlyIGFyZWFzXG4gIG5vZGVzLnNvcnQoZnVuY3Rpb24gKG4xLCBuMikge1xuICAgIGlmIChuMS5yZWN0LndpZHRoICogbjEucmVjdC5oZWlnaHQgPiBuMi5yZWN0LndpZHRoICogbjIucmVjdC5oZWlnaHQpIHJldHVybiAtMTtcbiAgICBpZiAobjEucmVjdC53aWR0aCAqIG4xLnJlY3QuaGVpZ2h0IDwgbjIucmVjdC53aWR0aCAqIG4yLnJlY3QuaGVpZ2h0KSByZXR1cm4gMTtcbiAgICByZXR1cm4gMDtcbiAgfSk7XG5cbiAgLy8gQ3JlYXRlIHRoZSBvcmdhbml6YXRpb24gLT4gdGlsZSBtZW1iZXJzXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgbE5vZGUgPSBub2Rlc1tpXTtcblxuICAgIGlmIChvcmdhbml6YXRpb24ucm93cy5sZW5ndGggPT0gMCkge1xuICAgICAgdGhpcy5pbnNlcnROb2RlVG9Sb3cob3JnYW5pemF0aW9uLCBsTm9kZSwgMCwgbWluV2lkdGgpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5jYW5BZGRIb3Jpem9udGFsKG9yZ2FuaXphdGlvbiwgbE5vZGUucmVjdC53aWR0aCwgbE5vZGUucmVjdC5oZWlnaHQpKSB7XG4gICAgICB0aGlzLmluc2VydE5vZGVUb1Jvdyhvcmdhbml6YXRpb24sIGxOb2RlLCB0aGlzLmdldFNob3J0ZXN0Um93SW5kZXgob3JnYW5pemF0aW9uKSwgbWluV2lkdGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmluc2VydE5vZGVUb1Jvdyhvcmdhbml6YXRpb24sIGxOb2RlLCBvcmdhbml6YXRpb24ucm93cy5sZW5ndGgsIG1pbldpZHRoKTtcbiAgICB9XG5cbiAgICB0aGlzLnNoaWZ0VG9MYXN0Um93KG9yZ2FuaXphdGlvbik7XG4gIH1cblxuICByZXR1cm4gb3JnYW5pemF0aW9uO1xufTtcblxuQ29TRUxheW91dC5wcm90b3R5cGUuaW5zZXJ0Tm9kZVRvUm93ID0gZnVuY3Rpb24gKG9yZ2FuaXphdGlvbiwgbm9kZSwgcm93SW5kZXgsIG1pbldpZHRoKSB7XG4gIHZhciBtaW5Db21wb3VuZFNpemUgPSBtaW5XaWR0aDtcblxuICAvLyBBZGQgbmV3IHJvdyBpZiBuZWVkZWRcbiAgaWYgKHJvd0luZGV4ID09IG9yZ2FuaXphdGlvbi5yb3dzLmxlbmd0aCkge1xuICAgIHZhciBzZWNvbmREaW1lbnNpb24gPSBbXTtcblxuICAgIG9yZ2FuaXphdGlvbi5yb3dzLnB1c2goc2Vjb25kRGltZW5zaW9uKTtcbiAgICBvcmdhbml6YXRpb24ucm93V2lkdGgucHVzaChtaW5Db21wb3VuZFNpemUpO1xuICAgIG9yZ2FuaXphdGlvbi5yb3dIZWlnaHQucHVzaCgwKTtcbiAgfVxuXG4gIC8vIFVwZGF0ZSByb3cgd2lkdGhcbiAgdmFyIHcgPSBvcmdhbml6YXRpb24ucm93V2lkdGhbcm93SW5kZXhdICsgbm9kZS5yZWN0LndpZHRoO1xuXG4gIGlmIChvcmdhbml6YXRpb24ucm93c1tyb3dJbmRleF0ubGVuZ3RoID4gMCkge1xuICAgIHcgKz0gb3JnYW5pemF0aW9uLmhvcml6b250YWxQYWRkaW5nO1xuICB9XG5cbiAgb3JnYW5pemF0aW9uLnJvd1dpZHRoW3Jvd0luZGV4XSA9IHc7XG4gIC8vIFVwZGF0ZSBjb21wb3VuZCB3aWR0aFxuICBpZiAob3JnYW5pemF0aW9uLndpZHRoIDwgdykge1xuICAgIG9yZ2FuaXphdGlvbi53aWR0aCA9IHc7XG4gIH1cblxuICAvLyBVcGRhdGUgaGVpZ2h0XG4gIHZhciBoID0gbm9kZS5yZWN0LmhlaWdodDtcbiAgaWYgKHJvd0luZGV4ID4gMCkgaCArPSBvcmdhbml6YXRpb24udmVydGljYWxQYWRkaW5nO1xuXG4gIHZhciBleHRyYUhlaWdodCA9IDA7XG4gIGlmIChoID4gb3JnYW5pemF0aW9uLnJvd0hlaWdodFtyb3dJbmRleF0pIHtcbiAgICBleHRyYUhlaWdodCA9IG9yZ2FuaXphdGlvbi5yb3dIZWlnaHRbcm93SW5kZXhdO1xuICAgIG9yZ2FuaXphdGlvbi5yb3dIZWlnaHRbcm93SW5kZXhdID0gaDtcbiAgICBleHRyYUhlaWdodCA9IG9yZ2FuaXphdGlvbi5yb3dIZWlnaHRbcm93SW5kZXhdIC0gZXh0cmFIZWlnaHQ7XG4gIH1cblxuICBvcmdhbml6YXRpb24uaGVpZ2h0ICs9IGV4dHJhSGVpZ2h0O1xuXG4gIC8vIEluc2VydCBub2RlXG4gIG9yZ2FuaXphdGlvbi5yb3dzW3Jvd0luZGV4XS5wdXNoKG5vZGUpO1xufTtcblxuLy9TY2FucyB0aGUgcm93cyBvZiBhbiBvcmdhbml6YXRpb24gYW5kIHJldHVybnMgdGhlIG9uZSB3aXRoIHRoZSBtaW4gd2lkdGhcbkNvU0VMYXlvdXQucHJvdG90eXBlLmdldFNob3J0ZXN0Um93SW5kZXggPSBmdW5jdGlvbiAob3JnYW5pemF0aW9uKSB7XG4gIHZhciByID0gLTE7XG4gIHZhciBtaW4gPSBOdW1iZXIuTUFYX1ZBTFVFO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgb3JnYW5pemF0aW9uLnJvd3MubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAob3JnYW5pemF0aW9uLnJvd1dpZHRoW2ldIDwgbWluKSB7XG4gICAgICByID0gaTtcbiAgICAgIG1pbiA9IG9yZ2FuaXphdGlvbi5yb3dXaWR0aFtpXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHI7XG59O1xuXG4vL1NjYW5zIHRoZSByb3dzIG9mIGFuIG9yZ2FuaXphdGlvbiBhbmQgcmV0dXJucyB0aGUgb25lIHdpdGggdGhlIG1heCB3aWR0aFxuQ29TRUxheW91dC5wcm90b3R5cGUuZ2V0TG9uZ2VzdFJvd0luZGV4ID0gZnVuY3Rpb24gKG9yZ2FuaXphdGlvbikge1xuICB2YXIgciA9IC0xO1xuICB2YXIgbWF4ID0gTnVtYmVyLk1JTl9WQUxVRTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IG9yZ2FuaXphdGlvbi5yb3dzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICBpZiAob3JnYW5pemF0aW9uLnJvd1dpZHRoW2ldID4gbWF4KSB7XG4gICAgICByID0gaTtcbiAgICAgIG1heCA9IG9yZ2FuaXphdGlvbi5yb3dXaWR0aFtpXTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcjtcbn07XG5cbi8qKlxuKiBUaGlzIG1ldGhvZCBjaGVja3Mgd2hldGhlciBhZGRpbmcgZXh0cmEgd2lkdGggdG8gdGhlIG9yZ2FuaXphdGlvbiB2aW9sYXRlc1xuKiB0aGUgYXNwZWN0IHJhdGlvKDEpIG9yIG5vdC5cbiovXG5Db1NFTGF5b3V0LnByb3RvdHlwZS5jYW5BZGRIb3Jpem9udGFsID0gZnVuY3Rpb24gKG9yZ2FuaXphdGlvbiwgZXh0cmFXaWR0aCwgZXh0cmFIZWlnaHQpIHtcblxuICB2YXIgc3JpID0gdGhpcy5nZXRTaG9ydGVzdFJvd0luZGV4KG9yZ2FuaXphdGlvbik7XG5cbiAgaWYgKHNyaSA8IDApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHZhciBtaW4gPSBvcmdhbml6YXRpb24ucm93V2lkdGhbc3JpXTtcblxuICBpZiAobWluICsgb3JnYW5pemF0aW9uLmhvcml6b250YWxQYWRkaW5nICsgZXh0cmFXaWR0aCA8PSBvcmdhbml6YXRpb24ud2lkdGgpIHJldHVybiB0cnVlO1xuXG4gIHZhciBoRGlmZiA9IDA7XG5cbiAgLy8gQWRkaW5nIHRvIGFuIGV4aXN0aW5nIHJvd1xuICBpZiAob3JnYW5pemF0aW9uLnJvd0hlaWdodFtzcmldIDwgZXh0cmFIZWlnaHQpIHtcbiAgICBpZiAoc3JpID4gMCkgaERpZmYgPSBleHRyYUhlaWdodCArIG9yZ2FuaXphdGlvbi52ZXJ0aWNhbFBhZGRpbmcgLSBvcmdhbml6YXRpb24ucm93SGVpZ2h0W3NyaV07XG4gIH1cblxuICB2YXIgYWRkX3RvX3Jvd19yYXRpbztcbiAgaWYgKG9yZ2FuaXphdGlvbi53aWR0aCAtIG1pbiA+PSBleHRyYVdpZHRoICsgb3JnYW5pemF0aW9uLmhvcml6b250YWxQYWRkaW5nKSB7XG4gICAgYWRkX3RvX3Jvd19yYXRpbyA9IChvcmdhbml6YXRpb24uaGVpZ2h0ICsgaERpZmYpIC8gKG1pbiArIGV4dHJhV2lkdGggKyBvcmdhbml6YXRpb24uaG9yaXpvbnRhbFBhZGRpbmcpO1xuICB9IGVsc2Uge1xuICAgIGFkZF90b19yb3dfcmF0aW8gPSAob3JnYW5pemF0aW9uLmhlaWdodCArIGhEaWZmKSAvIG9yZ2FuaXphdGlvbi53aWR0aDtcbiAgfVxuXG4gIC8vIEFkZGluZyBhIG5ldyByb3cgZm9yIHRoaXMgbm9kZVxuICBoRGlmZiA9IGV4dHJhSGVpZ2h0ICsgb3JnYW5pemF0aW9uLnZlcnRpY2FsUGFkZGluZztcbiAgdmFyIGFkZF9uZXdfcm93X3JhdGlvO1xuICBpZiAob3JnYW5pemF0aW9uLndpZHRoIDwgZXh0cmFXaWR0aCkge1xuICAgIGFkZF9uZXdfcm93X3JhdGlvID0gKG9yZ2FuaXphdGlvbi5oZWlnaHQgKyBoRGlmZikgLyBleHRyYVdpZHRoO1xuICB9IGVsc2Uge1xuICAgIGFkZF9uZXdfcm93X3JhdGlvID0gKG9yZ2FuaXphdGlvbi5oZWlnaHQgKyBoRGlmZikgLyBvcmdhbml6YXRpb24ud2lkdGg7XG4gIH1cblxuICBpZiAoYWRkX25ld19yb3dfcmF0aW8gPCAxKSBhZGRfbmV3X3Jvd19yYXRpbyA9IDEgLyBhZGRfbmV3X3Jvd19yYXRpbztcblxuICBpZiAoYWRkX3RvX3Jvd19yYXRpbyA8IDEpIGFkZF90b19yb3dfcmF0aW8gPSAxIC8gYWRkX3RvX3Jvd19yYXRpbztcblxuICByZXR1cm4gYWRkX3RvX3Jvd19yYXRpbyA8IGFkZF9uZXdfcm93X3JhdGlvO1xufTtcblxuLy9JZiBtb3ZpbmcgdGhlIGxhc3Qgbm9kZSBmcm9tIHRoZSBsb25nZXN0IHJvdyBhbmQgYWRkaW5nIGl0IHRvIHRoZSBsYXN0XG4vL3JvdyBtYWtlcyB0aGUgYm91bmRpbmcgYm94IHNtYWxsZXIsIGRvIGl0LlxuQ29TRUxheW91dC5wcm90b3R5cGUuc2hpZnRUb0xhc3RSb3cgPSBmdW5jdGlvbiAob3JnYW5pemF0aW9uKSB7XG4gIHZhciBsb25nZXN0ID0gdGhpcy5nZXRMb25nZXN0Um93SW5kZXgob3JnYW5pemF0aW9uKTtcbiAgdmFyIGxhc3QgPSBvcmdhbml6YXRpb24ucm93V2lkdGgubGVuZ3RoIC0gMTtcbiAgdmFyIHJvdyA9IG9yZ2FuaXphdGlvbi5yb3dzW2xvbmdlc3RdO1xuICB2YXIgbm9kZSA9IHJvd1tyb3cubGVuZ3RoIC0gMV07XG5cbiAgdmFyIGRpZmYgPSBub2RlLndpZHRoICsgb3JnYW5pemF0aW9uLmhvcml6b250YWxQYWRkaW5nO1xuXG4gIC8vIENoZWNrIGlmIHRoZXJlIGlzIGVub3VnaCBzcGFjZSBvbiB0aGUgbGFzdCByb3dcbiAgaWYgKG9yZ2FuaXphdGlvbi53aWR0aCAtIG9yZ2FuaXphdGlvbi5yb3dXaWR0aFtsYXN0XSA+IGRpZmYgJiYgbG9uZ2VzdCAhPSBsYXN0KSB7XG4gICAgLy8gUmVtb3ZlIHRoZSBsYXN0IGVsZW1lbnQgb2YgdGhlIGxvbmdlc3Qgcm93XG4gICAgcm93LnNwbGljZSgtMSwgMSk7XG5cbiAgICAvLyBQdXNoIGl0IHRvIHRoZSBsYXN0IHJvd1xuICAgIG9yZ2FuaXphdGlvbi5yb3dzW2xhc3RdLnB1c2gobm9kZSk7XG5cbiAgICBvcmdhbml6YXRpb24ucm93V2lkdGhbbG9uZ2VzdF0gPSBvcmdhbml6YXRpb24ucm93V2lkdGhbbG9uZ2VzdF0gLSBkaWZmO1xuICAgIG9yZ2FuaXphdGlvbi5yb3dXaWR0aFtsYXN0XSA9IG9yZ2FuaXphdGlvbi5yb3dXaWR0aFtsYXN0XSArIGRpZmY7XG4gICAgb3JnYW5pemF0aW9uLndpZHRoID0gb3JnYW5pemF0aW9uLnJvd1dpZHRoW2luc3RhbmNlLmdldExvbmdlc3RSb3dJbmRleChvcmdhbml6YXRpb24pXTtcblxuICAgIC8vIFVwZGF0ZSBoZWlnaHRzIG9mIHRoZSBvcmdhbml6YXRpb25cbiAgICB2YXIgbWF4SGVpZ2h0ID0gTnVtYmVyLk1JTl9WQUxVRTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvdy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHJvd1tpXS5oZWlnaHQgPiBtYXhIZWlnaHQpIG1heEhlaWdodCA9IHJvd1tpXS5oZWlnaHQ7XG4gICAgfVxuICAgIGlmIChsb25nZXN0ID4gMCkgbWF4SGVpZ2h0ICs9IG9yZ2FuaXphdGlvbi52ZXJ0aWNhbFBhZGRpbmc7XG5cbiAgICB2YXIgcHJldlRvdGFsID0gb3JnYW5pemF0aW9uLnJvd0hlaWdodFtsb25nZXN0XSArIG9yZ2FuaXphdGlvbi5yb3dIZWlnaHRbbGFzdF07XG5cbiAgICBvcmdhbml6YXRpb24ucm93SGVpZ2h0W2xvbmdlc3RdID0gbWF4SGVpZ2h0O1xuICAgIGlmIChvcmdhbml6YXRpb24ucm93SGVpZ2h0W2xhc3RdIDwgbm9kZS5oZWlnaHQgKyBvcmdhbml6YXRpb24udmVydGljYWxQYWRkaW5nKSBvcmdhbml6YXRpb24ucm93SGVpZ2h0W2xhc3RdID0gbm9kZS5oZWlnaHQgKyBvcmdhbml6YXRpb24udmVydGljYWxQYWRkaW5nO1xuXG4gICAgdmFyIGZpbmFsVG90YWwgPSBvcmdhbml6YXRpb24ucm93SGVpZ2h0W2xvbmdlc3RdICsgb3JnYW5pemF0aW9uLnJvd0hlaWdodFtsYXN0XTtcbiAgICBvcmdhbml6YXRpb24uaGVpZ2h0ICs9IGZpbmFsVG90YWwgLSBwcmV2VG90YWw7XG5cbiAgICB0aGlzLnNoaWZ0VG9MYXN0Um93KG9yZ2FuaXphdGlvbik7XG4gIH1cbn07XG5cbkNvU0VMYXlvdXQucHJvdG90eXBlLnRpbGluZ1ByZUxheW91dCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKENvU0VDb25zdGFudHMuVElMRSkge1xuICAgIC8vIEZpbmQgemVybyBkZWdyZWUgbm9kZXMgYW5kIGNyZWF0ZSBhIGNvbXBvdW5kIGZvciBlYWNoIGxldmVsXG4gICAgdGhpcy5ncm91cFplcm9EZWdyZWVNZW1iZXJzKCk7XG4gICAgLy8gVGlsZSBhbmQgY2xlYXIgY2hpbGRyZW4gb2YgZWFjaCBjb21wb3VuZFxuICAgIHRoaXMuY2xlYXJDb21wb3VuZHMoKTtcbiAgICAvLyBTZXBhcmF0ZWx5IHRpbGUgYW5kIGNsZWFyIHplcm8gZGVncmVlIG5vZGVzIGZvciBlYWNoIGxldmVsXG4gICAgdGhpcy5jbGVhclplcm9EZWdyZWVNZW1iZXJzKCk7XG4gIH1cbn07XG5cbkNvU0VMYXlvdXQucHJvdG90eXBlLnRpbGluZ1Bvc3RMYXlvdXQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChDb1NFQ29uc3RhbnRzLlRJTEUpIHtcbiAgICB0aGlzLnJlcG9wdWxhdGVaZXJvRGVncmVlTWVtYmVycygpO1xuICAgIHRoaXMucmVwb3B1bGF0ZUNvbXBvdW5kcygpO1xuICB9XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU2VjdGlvbjogVHJlZSBSZWR1Y3Rpb24gbWV0aG9kc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFJlZHVjZSB0cmVlcyBcbkNvU0VMYXlvdXQucHJvdG90eXBlLnJlZHVjZVRyZWVzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgcHJ1bmVkTm9kZXNBbGwgPSBbXTtcbiAgdmFyIGNvbnRhaW5zTGVhZiA9IHRydWU7XG4gIHZhciBub2RlO1xuXG4gIHdoaWxlIChjb250YWluc0xlYWYpIHtcbiAgICB2YXIgYWxsTm9kZXMgPSB0aGlzLmdyYXBoTWFuYWdlci5nZXRBbGxOb2RlcygpO1xuICAgIHZhciBwcnVuZWROb2Rlc0luU3RlcFRlbXAgPSBbXTtcbiAgICBjb250YWluc0xlYWYgPSBmYWxzZTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWxsTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG5vZGUgPSBhbGxOb2Rlc1tpXTtcbiAgICAgIGlmIChub2RlLmdldEVkZ2VzKCkubGVuZ3RoID09IDEgJiYgIW5vZGUuZ2V0RWRnZXMoKVswXS5pc0ludGVyR3JhcGggJiYgbm9kZS5nZXRDaGlsZCgpID09IG51bGwpIHtcbiAgICAgICAgcHJ1bmVkTm9kZXNJblN0ZXBUZW1wLnB1c2goW25vZGUsIG5vZGUuZ2V0RWRnZXMoKVswXSwgbm9kZS5nZXRPd25lcigpXSk7XG4gICAgICAgIGNvbnRhaW5zTGVhZiA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChjb250YWluc0xlYWYgPT0gdHJ1ZSkge1xuICAgICAgdmFyIHBydW5lZE5vZGVzSW5TdGVwID0gW107XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBydW5lZE5vZGVzSW5TdGVwVGVtcC5sZW5ndGg7IGorKykge1xuICAgICAgICBpZiAocHJ1bmVkTm9kZXNJblN0ZXBUZW1wW2pdWzBdLmdldEVkZ2VzKCkubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICBwcnVuZWROb2Rlc0luU3RlcC5wdXNoKHBydW5lZE5vZGVzSW5TdGVwVGVtcFtqXSk7XG4gICAgICAgICAgcHJ1bmVkTm9kZXNJblN0ZXBUZW1wW2pdWzBdLmdldE93bmVyKCkucmVtb3ZlKHBydW5lZE5vZGVzSW5TdGVwVGVtcFtqXVswXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHBydW5lZE5vZGVzQWxsLnB1c2gocHJ1bmVkTm9kZXNJblN0ZXApO1xuICAgICAgdGhpcy5ncmFwaE1hbmFnZXIucmVzZXRBbGxOb2RlcygpO1xuICAgICAgdGhpcy5ncmFwaE1hbmFnZXIucmVzZXRBbGxFZGdlcygpO1xuICAgIH1cbiAgfVxuICB0aGlzLnBydW5lZE5vZGVzQWxsID0gcHJ1bmVkTm9kZXNBbGw7XG59O1xuXG4vLyBHcm93IHRyZWUgb25lIHN0ZXAgXG5Db1NFTGF5b3V0LnByb3RvdHlwZS5ncm93VHJlZSA9IGZ1bmN0aW9uIChwcnVuZWROb2Rlc0FsbCkge1xuICB2YXIgbGVuZ3RoT2ZQcnVuZWROb2Rlc0luU3RlcCA9IHBydW5lZE5vZGVzQWxsLmxlbmd0aDtcbiAgdmFyIHBydW5lZE5vZGVzSW5TdGVwID0gcHJ1bmVkTm9kZXNBbGxbbGVuZ3RoT2ZQcnVuZWROb2Rlc0luU3RlcCAtIDFdO1xuXG4gIHZhciBub2RlRGF0YTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcnVuZWROb2Rlc0luU3RlcC5sZW5ndGg7IGkrKykge1xuICAgIG5vZGVEYXRhID0gcHJ1bmVkTm9kZXNJblN0ZXBbaV07XG5cbiAgICB0aGlzLmZpbmRQbGFjZWZvclBydW5lZE5vZGUobm9kZURhdGEpO1xuXG4gICAgbm9kZURhdGFbMl0uYWRkKG5vZGVEYXRhWzBdKTtcbiAgICBub2RlRGF0YVsyXS5hZGQobm9kZURhdGFbMV0sIG5vZGVEYXRhWzFdLnNvdXJjZSwgbm9kZURhdGFbMV0udGFyZ2V0KTtcbiAgfVxuXG4gIHBydW5lZE5vZGVzQWxsLnNwbGljZShwcnVuZWROb2Rlc0FsbC5sZW5ndGggLSAxLCAxKTtcbiAgdGhpcy5ncmFwaE1hbmFnZXIucmVzZXRBbGxOb2RlcygpO1xuICB0aGlzLmdyYXBoTWFuYWdlci5yZXNldEFsbEVkZ2VzKCk7XG59O1xuXG4vLyBGaW5kIGFuIGFwcHJvcHJpYXRlIHBvc2l0aW9uIHRvIHJlcGxhY2UgcHJ1bmVkIG5vZGUsIHRoaXMgbWV0aG9kIGNhbiBiZSBpbXByb3ZlZFxuQ29TRUxheW91dC5wcm90b3R5cGUuZmluZFBsYWNlZm9yUHJ1bmVkTm9kZSA9IGZ1bmN0aW9uIChub2RlRGF0YSkge1xuXG4gIHZhciBncmlkRm9yUHJ1bmVkTm9kZTtcbiAgdmFyIG5vZGVUb0Nvbm5lY3Q7XG4gIHZhciBwcnVuZWROb2RlID0gbm9kZURhdGFbMF07XG4gIGlmIChwcnVuZWROb2RlID09IG5vZGVEYXRhWzFdLnNvdXJjZSkge1xuICAgIG5vZGVUb0Nvbm5lY3QgPSBub2RlRGF0YVsxXS50YXJnZXQ7XG4gIH0gZWxzZSB7XG4gICAgbm9kZVRvQ29ubmVjdCA9IG5vZGVEYXRhWzFdLnNvdXJjZTtcbiAgfVxuICB2YXIgc3RhcnRHcmlkWCA9IG5vZGVUb0Nvbm5lY3Quc3RhcnRYO1xuICB2YXIgZmluaXNoR3JpZFggPSBub2RlVG9Db25uZWN0LmZpbmlzaFg7XG4gIHZhciBzdGFydEdyaWRZID0gbm9kZVRvQ29ubmVjdC5zdGFydFk7XG4gIHZhciBmaW5pc2hHcmlkWSA9IG5vZGVUb0Nvbm5lY3QuZmluaXNoWTtcblxuICB2YXIgdXBOb2RlQ291bnQgPSAwO1xuICB2YXIgZG93bk5vZGVDb3VudCA9IDA7XG4gIHZhciByaWdodE5vZGVDb3VudCA9IDA7XG4gIHZhciBsZWZ0Tm9kZUNvdW50ID0gMDtcbiAgdmFyIGNvbnRyb2xSZWdpb25zID0gW3VwTm9kZUNvdW50LCByaWdodE5vZGVDb3VudCwgZG93bk5vZGVDb3VudCwgbGVmdE5vZGVDb3VudF07XG5cbiAgaWYgKHN0YXJ0R3JpZFkgPiAwKSB7XG4gICAgZm9yICh2YXIgaSA9IHN0YXJ0R3JpZFg7IGkgPD0gZmluaXNoR3JpZFg7IGkrKykge1xuICAgICAgY29udHJvbFJlZ2lvbnNbMF0gKz0gdGhpcy5ncmlkW2ldW3N0YXJ0R3JpZFkgLSAxXS5sZW5ndGggKyB0aGlzLmdyaWRbaV1bc3RhcnRHcmlkWV0ubGVuZ3RoIC0gMTtcbiAgICB9XG4gIH1cbiAgaWYgKGZpbmlzaEdyaWRYIDwgdGhpcy5ncmlkLmxlbmd0aCAtIDEpIHtcbiAgICBmb3IgKHZhciBpID0gc3RhcnRHcmlkWTsgaSA8PSBmaW5pc2hHcmlkWTsgaSsrKSB7XG4gICAgICBjb250cm9sUmVnaW9uc1sxXSArPSB0aGlzLmdyaWRbZmluaXNoR3JpZFggKyAxXVtpXS5sZW5ndGggKyB0aGlzLmdyaWRbZmluaXNoR3JpZFhdW2ldLmxlbmd0aCAtIDE7XG4gICAgfVxuICB9XG4gIGlmIChmaW5pc2hHcmlkWSA8IHRoaXMuZ3JpZFswXS5sZW5ndGggLSAxKSB7XG4gICAgZm9yICh2YXIgaSA9IHN0YXJ0R3JpZFg7IGkgPD0gZmluaXNoR3JpZFg7IGkrKykge1xuICAgICAgY29udHJvbFJlZ2lvbnNbMl0gKz0gdGhpcy5ncmlkW2ldW2ZpbmlzaEdyaWRZICsgMV0ubGVuZ3RoICsgdGhpcy5ncmlkW2ldW2ZpbmlzaEdyaWRZXS5sZW5ndGggLSAxO1xuICAgIH1cbiAgfVxuICBpZiAoc3RhcnRHcmlkWCA+IDApIHtcbiAgICBmb3IgKHZhciBpID0gc3RhcnRHcmlkWTsgaSA8PSBmaW5pc2hHcmlkWTsgaSsrKSB7XG4gICAgICBjb250cm9sUmVnaW9uc1szXSArPSB0aGlzLmdyaWRbc3RhcnRHcmlkWCAtIDFdW2ldLmxlbmd0aCArIHRoaXMuZ3JpZFtzdGFydEdyaWRYXVtpXS5sZW5ndGggLSAxO1xuICAgIH1cbiAgfVxuICB2YXIgbWluID0gSW50ZWdlci5NQVhfVkFMVUU7XG4gIHZhciBtaW5Db3VudDtcbiAgdmFyIG1pbkluZGV4O1xuICBmb3IgKHZhciBqID0gMDsgaiA8IGNvbnRyb2xSZWdpb25zLmxlbmd0aDsgaisrKSB7XG4gICAgaWYgKGNvbnRyb2xSZWdpb25zW2pdIDwgbWluKSB7XG4gICAgICBtaW4gPSBjb250cm9sUmVnaW9uc1tqXTtcbiAgICAgIG1pbkNvdW50ID0gMTtcbiAgICAgIG1pbkluZGV4ID0gajtcbiAgICB9IGVsc2UgaWYgKGNvbnRyb2xSZWdpb25zW2pdID09IG1pbikge1xuICAgICAgbWluQ291bnQrKztcbiAgICB9XG4gIH1cblxuICBpZiAobWluQ291bnQgPT0gMyAmJiBtaW4gPT0gMCkge1xuICAgIGlmIChjb250cm9sUmVnaW9uc1swXSA9PSAwICYmIGNvbnRyb2xSZWdpb25zWzFdID09IDAgJiYgY29udHJvbFJlZ2lvbnNbMl0gPT0gMCkge1xuICAgICAgZ3JpZEZvclBydW5lZE5vZGUgPSAxO1xuICAgIH0gZWxzZSBpZiAoY29udHJvbFJlZ2lvbnNbMF0gPT0gMCAmJiBjb250cm9sUmVnaW9uc1sxXSA9PSAwICYmIGNvbnRyb2xSZWdpb25zWzNdID09IDApIHtcbiAgICAgIGdyaWRGb3JQcnVuZWROb2RlID0gMDtcbiAgICB9IGVsc2UgaWYgKGNvbnRyb2xSZWdpb25zWzBdID09IDAgJiYgY29udHJvbFJlZ2lvbnNbMl0gPT0gMCAmJiBjb250cm9sUmVnaW9uc1szXSA9PSAwKSB7XG4gICAgICBncmlkRm9yUHJ1bmVkTm9kZSA9IDM7XG4gICAgfSBlbHNlIGlmIChjb250cm9sUmVnaW9uc1sxXSA9PSAwICYmIGNvbnRyb2xSZWdpb25zWzJdID09IDAgJiYgY29udHJvbFJlZ2lvbnNbM10gPT0gMCkge1xuICAgICAgZ3JpZEZvclBydW5lZE5vZGUgPSAyO1xuICAgIH1cbiAgfSBlbHNlIGlmIChtaW5Db3VudCA9PSAyICYmIG1pbiA9PSAwKSB7XG4gICAgdmFyIHJhbmRvbSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpO1xuICAgIGlmIChjb250cm9sUmVnaW9uc1swXSA9PSAwICYmIGNvbnRyb2xSZWdpb25zWzFdID09IDApIHtcbiAgICAgIDtcbiAgICAgIGlmIChyYW5kb20gPT0gMCkge1xuICAgICAgICBncmlkRm9yUHJ1bmVkTm9kZSA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBncmlkRm9yUHJ1bmVkTm9kZSA9IDE7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjb250cm9sUmVnaW9uc1swXSA9PSAwICYmIGNvbnRyb2xSZWdpb25zWzJdID09IDApIHtcbiAgICAgIGlmIChyYW5kb20gPT0gMCkge1xuICAgICAgICBncmlkRm9yUHJ1bmVkTm9kZSA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBncmlkRm9yUHJ1bmVkTm9kZSA9IDI7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjb250cm9sUmVnaW9uc1swXSA9PSAwICYmIGNvbnRyb2xSZWdpb25zWzNdID09IDApIHtcbiAgICAgIGlmIChyYW5kb20gPT0gMCkge1xuICAgICAgICBncmlkRm9yUHJ1bmVkTm9kZSA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBncmlkRm9yUHJ1bmVkTm9kZSA9IDM7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjb250cm9sUmVnaW9uc1sxXSA9PSAwICYmIGNvbnRyb2xSZWdpb25zWzJdID09IDApIHtcbiAgICAgIGlmIChyYW5kb20gPT0gMCkge1xuICAgICAgICBncmlkRm9yUHJ1bmVkTm9kZSA9IDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBncmlkRm9yUHJ1bmVkTm9kZSA9IDI7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjb250cm9sUmVnaW9uc1sxXSA9PSAwICYmIGNvbnRyb2xSZWdpb25zWzNdID09IDApIHtcbiAgICAgIGlmIChyYW5kb20gPT0gMCkge1xuICAgICAgICBncmlkRm9yUHJ1bmVkTm9kZSA9IDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBncmlkRm9yUHJ1bmVkTm9kZSA9IDM7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChyYW5kb20gPT0gMCkge1xuICAgICAgICBncmlkRm9yUHJ1bmVkTm9kZSA9IDI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBncmlkRm9yUHJ1bmVkTm9kZSA9IDM7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKG1pbkNvdW50ID09IDQgJiYgbWluID09IDApIHtcbiAgICB2YXIgcmFuZG9tID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNCk7XG4gICAgZ3JpZEZvclBydW5lZE5vZGUgPSByYW5kb207XG4gIH0gZWxzZSB7XG4gICAgZ3JpZEZvclBydW5lZE5vZGUgPSBtaW5JbmRleDtcbiAgfVxuXG4gIGlmIChncmlkRm9yUHJ1bmVkTm9kZSA9PSAwKSB7XG4gICAgcHJ1bmVkTm9kZS5zZXRDZW50ZXIobm9kZVRvQ29ubmVjdC5nZXRDZW50ZXJYKCksIG5vZGVUb0Nvbm5lY3QuZ2V0Q2VudGVyWSgpIC0gbm9kZVRvQ29ubmVjdC5nZXRIZWlnaHQoKSAvIDIgLSBGRExheW91dENvbnN0YW50cy5ERUZBVUxUX0VER0VfTEVOR1RIIC0gcHJ1bmVkTm9kZS5nZXRIZWlnaHQoKSAvIDIpO1xuICB9IGVsc2UgaWYgKGdyaWRGb3JQcnVuZWROb2RlID09IDEpIHtcbiAgICBwcnVuZWROb2RlLnNldENlbnRlcihub2RlVG9Db25uZWN0LmdldENlbnRlclgoKSArIG5vZGVUb0Nvbm5lY3QuZ2V0V2lkdGgoKSAvIDIgKyBGRExheW91dENvbnN0YW50cy5ERUZBVUxUX0VER0VfTEVOR1RIICsgcHJ1bmVkTm9kZS5nZXRXaWR0aCgpIC8gMiwgbm9kZVRvQ29ubmVjdC5nZXRDZW50ZXJZKCkpO1xuICB9IGVsc2UgaWYgKGdyaWRGb3JQcnVuZWROb2RlID09IDIpIHtcbiAgICBwcnVuZWROb2RlLnNldENlbnRlcihub2RlVG9Db25uZWN0LmdldENlbnRlclgoKSwgbm9kZVRvQ29ubmVjdC5nZXRDZW50ZXJZKCkgKyBub2RlVG9Db25uZWN0LmdldEhlaWdodCgpIC8gMiArIEZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfRURHRV9MRU5HVEggKyBwcnVuZWROb2RlLmdldEhlaWdodCgpIC8gMik7XG4gIH0gZWxzZSB7XG4gICAgcHJ1bmVkTm9kZS5zZXRDZW50ZXIobm9kZVRvQ29ubmVjdC5nZXRDZW50ZXJYKCkgLSBub2RlVG9Db25uZWN0LmdldFdpZHRoKCkgLyAyIC0gRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9FREdFX0xFTkdUSCAtIHBydW5lZE5vZGUuZ2V0V2lkdGgoKSAvIDIsIG5vZGVUb0Nvbm5lY3QuZ2V0Q2VudGVyWSgpKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb1NFTGF5b3V0O1xuXG4vKioqLyB9KSxcbi8qIDcgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cblxudmFyIGNvc2VCYXNlID0ge307XG5cbmNvc2VCYXNlLmxheW91dEJhc2UgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuY29zZUJhc2UuQ29TRUNvbnN0YW50cyA9IF9fd2VicGFja19yZXF1aXJlX18oMSk7XG5jb3NlQmFzZS5Db1NFRWRnZSA9IF9fd2VicGFja19yZXF1aXJlX18oMik7XG5jb3NlQmFzZS5Db1NFR3JhcGggPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDMpO1xuY29zZUJhc2UuQ29TRUdyYXBoTWFuYWdlciA9IF9fd2VicGFja19yZXF1aXJlX18oNCk7XG5jb3NlQmFzZS5Db1NFTGF5b3V0ID0gX193ZWJwYWNrX3JlcXVpcmVfXyg2KTtcbmNvc2VCYXNlLkNvU0VOb2RlID0gX193ZWJwYWNrX3JlcXVpcmVfXyg1KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb3NlQmFzZTtcblxuLyoqKi8gfSlcbi8qKioqKiovIF0pO1xufSk7IiwKICAgICIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoXCJjb3NlLWJhc2VcIikpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW1wiY29zZS1iYXNlXCJdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcImN5dG9zY2FwZUNvc2VCaWxrZW50XCJdID0gZmFjdG9yeShyZXF1aXJlKFwiY29zZS1iYXNlXCIpKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJjeXRvc2NhcGVDb3NlQmlsa2VudFwiXSA9IGZhY3Rvcnkocm9vdFtcImNvc2VCYXNlXCJdKTtcbn0pKHRoaXMsIGZ1bmN0aW9uKF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfMF9fKSB7XG5yZXR1cm4gLyoqKioqKi8gKGZ1bmN0aW9uKG1vZHVsZXMpIHsgLy8gd2VicGFja0Jvb3RzdHJhcFxuLyoqKioqKi8gXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuLyoqKioqKi8gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuLyoqKioqKi8gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4vKioqKioqLyBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbi8qKioqKiovIFx0XHR9XG4vKioqKioqLyBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbi8qKioqKiovIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4vKioqKioqLyBcdFx0XHRpOiBtb2R1bGVJZCxcbi8qKioqKiovIFx0XHRcdGw6IGZhbHNlLFxuLyoqKioqKi8gXHRcdFx0ZXhwb3J0czoge31cbi8qKioqKiovIFx0XHR9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbi8qKioqKiovIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuLyoqKioqKi8gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbi8qKioqKiovIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4vKioqKioqLyBcdH1cbi8qKioqKiovXG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGlkZW50aXR5IGZ1bmN0aW9uIGZvciBjYWxsaW5nIGhhcm1vbnkgaW1wb3J0cyB3aXRoIHRoZSBjb3JyZWN0IGNvbnRleHRcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5pID0gZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuLyoqKioqKi8gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbi8qKioqKiovIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4vKioqKioqLyBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4vKioqKioqLyBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4vKioqKioqLyBcdFx0XHRcdGdldDogZ2V0dGVyXG4vKioqKioqLyBcdFx0XHR9KTtcbi8qKioqKiovIFx0XHR9XG4vKioqKioqLyBcdH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbi8qKioqKiovIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbi8qKioqKiovIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4vKioqKioqLyBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuLyoqKioqKi8gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbi8qKioqKiovIFx0XHRyZXR1cm4gZ2V0dGVyO1xuLyoqKioqKi8gXHR9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8qKioqKiovIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMSk7XG4vKioqKioqLyB9KVxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKioqKiovIChbXG4vKiAwICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV8wX187XG5cbi8qKiovIH0pLFxuLyogMSAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcblxuXG52YXIgTGF5b3V0Q29uc3RhbnRzID0gX193ZWJwYWNrX3JlcXVpcmVfXygwKS5sYXlvdXRCYXNlLkxheW91dENvbnN0YW50cztcbnZhciBGRExheW91dENvbnN0YW50cyA9IF9fd2VicGFja19yZXF1aXJlX18oMCkubGF5b3V0QmFzZS5GRExheW91dENvbnN0YW50cztcbnZhciBDb1NFQ29uc3RhbnRzID0gX193ZWJwYWNrX3JlcXVpcmVfXygwKS5Db1NFQ29uc3RhbnRzO1xudmFyIENvU0VMYXlvdXQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDApLkNvU0VMYXlvdXQ7XG52YXIgQ29TRU5vZGUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDApLkNvU0VOb2RlO1xudmFyIFBvaW50RCA9IF9fd2VicGFja19yZXF1aXJlX18oMCkubGF5b3V0QmFzZS5Qb2ludEQ7XG52YXIgRGltZW5zaW9uRCA9IF9fd2VicGFja19yZXF1aXJlX18oMCkubGF5b3V0QmFzZS5EaW1lbnNpb25EO1xuXG52YXIgZGVmYXVsdHMgPSB7XG4gIC8vIENhbGxlZCBvbiBgbGF5b3V0cmVhZHlgXG4gIHJlYWR5OiBmdW5jdGlvbiByZWFkeSgpIHt9LFxuICAvLyBDYWxsZWQgb24gYGxheW91dHN0b3BgXG4gIHN0b3A6IGZ1bmN0aW9uIHN0b3AoKSB7fSxcbiAgLy8gJ2RyYWZ0JywgJ2RlZmF1bHQnIG9yICdwcm9vZlwiIFxuICAvLyAtICdkcmFmdCcgZmFzdCBjb29saW5nIHJhdGUgXG4gIC8vIC0gJ2RlZmF1bHQnIG1vZGVyYXRlIGNvb2xpbmcgcmF0ZSBcbiAgLy8gLSBcInByb29mXCIgc2xvdyBjb29saW5nIHJhdGVcbiAgcXVhbGl0eTogJ2RlZmF1bHQnLFxuICAvLyBpbmNsdWRlIGxhYmVscyBpbiBub2RlIGRpbWVuc2lvbnNcbiAgbm9kZURpbWVuc2lvbnNJbmNsdWRlTGFiZWxzOiBmYWxzZSxcbiAgLy8gbnVtYmVyIG9mIHRpY2tzIHBlciBmcmFtZTsgaGlnaGVyIGlzIGZhc3RlciBidXQgbW9yZSBqZXJreVxuICByZWZyZXNoOiAzMCxcbiAgLy8gV2hldGhlciB0byBmaXQgdGhlIG5ldHdvcmsgdmlldyBhZnRlciB3aGVuIGRvbmVcbiAgZml0OiB0cnVlLFxuICAvLyBQYWRkaW5nIG9uIGZpdFxuICBwYWRkaW5nOiAxMCxcbiAgLy8gV2hldGhlciB0byBlbmFibGUgaW5jcmVtZW50YWwgbW9kZVxuICByYW5kb21pemU6IHRydWUsXG4gIC8vIE5vZGUgcmVwdWxzaW9uIChub24gb3ZlcmxhcHBpbmcpIG11bHRpcGxpZXJcbiAgbm9kZVJlcHVsc2lvbjogNDUwMCxcbiAgLy8gSWRlYWwgZWRnZSAobm9uIG5lc3RlZCkgbGVuZ3RoXG4gIGlkZWFsRWRnZUxlbmd0aDogNTAsXG4gIC8vIERpdmlzb3IgdG8gY29tcHV0ZSBlZGdlIGZvcmNlc1xuICBlZGdlRWxhc3RpY2l0eTogMC40NSxcbiAgLy8gTmVzdGluZyBmYWN0b3IgKG11bHRpcGxpZXIpIHRvIGNvbXB1dGUgaWRlYWwgZWRnZSBsZW5ndGggZm9yIG5lc3RlZCBlZGdlc1xuICBuZXN0aW5nRmFjdG9yOiAwLjEsXG4gIC8vIEdyYXZpdHkgZm9yY2UgKGNvbnN0YW50KVxuICBncmF2aXR5OiAwLjI1LFxuICAvLyBNYXhpbXVtIG51bWJlciBvZiBpdGVyYXRpb25zIHRvIHBlcmZvcm1cbiAgbnVtSXRlcjogMjUwMCxcbiAgLy8gRm9yIGVuYWJsaW5nIHRpbGluZ1xuICB0aWxlOiB0cnVlLFxuICAvLyBUeXBlIG9mIGxheW91dCBhbmltYXRpb24uIFRoZSBvcHRpb24gc2V0IGlzIHsnZHVyaW5nJywgJ2VuZCcsIGZhbHNlfVxuICBhbmltYXRlOiAnZW5kJyxcbiAgLy8gRHVyYXRpb24gZm9yIGFuaW1hdGU6ZW5kXG4gIGFuaW1hdGlvbkR1cmF0aW9uOiA1MDAsXG4gIC8vIFJlcHJlc2VudHMgdGhlIGFtb3VudCBvZiB0aGUgdmVydGljYWwgc3BhY2UgdG8gcHV0IGJldHdlZW4gdGhlIHplcm8gZGVncmVlIG1lbWJlcnMgZHVyaW5nIHRoZSB0aWxpbmcgb3BlcmF0aW9uKGNhbiBhbHNvIGJlIGEgZnVuY3Rpb24pXG4gIHRpbGluZ1BhZGRpbmdWZXJ0aWNhbDogMTAsXG4gIC8vIFJlcHJlc2VudHMgdGhlIGFtb3VudCBvZiB0aGUgaG9yaXpvbnRhbCBzcGFjZSB0byBwdXQgYmV0d2VlbiB0aGUgemVybyBkZWdyZWUgbWVtYmVycyBkdXJpbmcgdGhlIHRpbGluZyBvcGVyYXRpb24oY2FuIGFsc28gYmUgYSBmdW5jdGlvbilcbiAgdGlsaW5nUGFkZGluZ0hvcml6b250YWw6IDEwLFxuICAvLyBHcmF2aXR5IHJhbmdlIChjb25zdGFudCkgZm9yIGNvbXBvdW5kc1xuICBncmF2aXR5UmFuZ2VDb21wb3VuZDogMS41LFxuICAvLyBHcmF2aXR5IGZvcmNlIChjb25zdGFudCkgZm9yIGNvbXBvdW5kc1xuICBncmF2aXR5Q29tcG91bmQ6IDEuMCxcbiAgLy8gR3Jhdml0eSByYW5nZSAoY29uc3RhbnQpXG4gIGdyYXZpdHlSYW5nZTogMy44LFxuICAvLyBJbml0aWFsIGNvb2xpbmcgZmFjdG9yIGZvciBpbmNyZW1lbnRhbCBsYXlvdXRcbiAgaW5pdGlhbEVuZXJneU9uSW5jcmVtZW50YWw6IDAuNVxufTtcblxuZnVuY3Rpb24gZXh0ZW5kKGRlZmF1bHRzLCBvcHRpb25zKSB7XG4gIHZhciBvYmogPSB7fTtcblxuICBmb3IgKHZhciBpIGluIGRlZmF1bHRzKSB7XG4gICAgb2JqW2ldID0gZGVmYXVsdHNbaV07XG4gIH1cblxuICBmb3IgKHZhciBpIGluIG9wdGlvbnMpIHtcbiAgICBvYmpbaV0gPSBvcHRpb25zW2ldO1xuICB9XG5cbiAgcmV0dXJuIG9iajtcbn07XG5cbmZ1bmN0aW9uIF9Db1NFTGF5b3V0KF9vcHRpb25zKSB7XG4gIHRoaXMub3B0aW9ucyA9IGV4dGVuZChkZWZhdWx0cywgX29wdGlvbnMpO1xuICBnZXRVc2VyT3B0aW9ucyh0aGlzLm9wdGlvbnMpO1xufVxuXG52YXIgZ2V0VXNlck9wdGlvbnMgPSBmdW5jdGlvbiBnZXRVc2VyT3B0aW9ucyhvcHRpb25zKSB7XG4gIGlmIChvcHRpb25zLm5vZGVSZXB1bHNpb24gIT0gbnVsbCkgQ29TRUNvbnN0YW50cy5ERUZBVUxUX1JFUFVMU0lPTl9TVFJFTkdUSCA9IEZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfUkVQVUxTSU9OX1NUUkVOR1RIID0gb3B0aW9ucy5ub2RlUmVwdWxzaW9uO1xuICBpZiAob3B0aW9ucy5pZGVhbEVkZ2VMZW5ndGggIT0gbnVsbCkgQ29TRUNvbnN0YW50cy5ERUZBVUxUX0VER0VfTEVOR1RIID0gRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9FREdFX0xFTkdUSCA9IG9wdGlvbnMuaWRlYWxFZGdlTGVuZ3RoO1xuICBpZiAob3B0aW9ucy5lZGdlRWxhc3RpY2l0eSAhPSBudWxsKSBDb1NFQ29uc3RhbnRzLkRFRkFVTFRfU1BSSU5HX1NUUkVOR1RIID0gRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9TUFJJTkdfU1RSRU5HVEggPSBvcHRpb25zLmVkZ2VFbGFzdGljaXR5O1xuICBpZiAob3B0aW9ucy5uZXN0aW5nRmFjdG9yICE9IG51bGwpIENvU0VDb25zdGFudHMuUEVSX0xFVkVMX0lERUFMX0VER0VfTEVOR1RIX0ZBQ1RPUiA9IEZETGF5b3V0Q29uc3RhbnRzLlBFUl9MRVZFTF9JREVBTF9FREdFX0xFTkdUSF9GQUNUT1IgPSBvcHRpb25zLm5lc3RpbmdGYWN0b3I7XG4gIGlmIChvcHRpb25zLmdyYXZpdHkgIT0gbnVsbCkgQ29TRUNvbnN0YW50cy5ERUZBVUxUX0dSQVZJVFlfU1RSRU5HVEggPSBGRExheW91dENvbnN0YW50cy5ERUZBVUxUX0dSQVZJVFlfU1RSRU5HVEggPSBvcHRpb25zLmdyYXZpdHk7XG4gIGlmIChvcHRpb25zLm51bUl0ZXIgIT0gbnVsbCkgQ29TRUNvbnN0YW50cy5NQVhfSVRFUkFUSU9OUyA9IEZETGF5b3V0Q29uc3RhbnRzLk1BWF9JVEVSQVRJT05TID0gb3B0aW9ucy5udW1JdGVyO1xuICBpZiAob3B0aW9ucy5ncmF2aXR5UmFuZ2UgIT0gbnVsbCkgQ29TRUNvbnN0YW50cy5ERUZBVUxUX0dSQVZJVFlfUkFOR0VfRkFDVE9SID0gRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9HUkFWSVRZX1JBTkdFX0ZBQ1RPUiA9IG9wdGlvbnMuZ3Jhdml0eVJhbmdlO1xuICBpZiAob3B0aW9ucy5ncmF2aXR5Q29tcG91bmQgIT0gbnVsbCkgQ29TRUNvbnN0YW50cy5ERUZBVUxUX0NPTVBPVU5EX0dSQVZJVFlfU1RSRU5HVEggPSBGRExheW91dENvbnN0YW50cy5ERUZBVUxUX0NPTVBPVU5EX0dSQVZJVFlfU1RSRU5HVEggPSBvcHRpb25zLmdyYXZpdHlDb21wb3VuZDtcbiAgaWYgKG9wdGlvbnMuZ3Jhdml0eVJhbmdlQ29tcG91bmQgIT0gbnVsbCkgQ29TRUNvbnN0YW50cy5ERUZBVUxUX0NPTVBPVU5EX0dSQVZJVFlfUkFOR0VfRkFDVE9SID0gRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9DT01QT1VORF9HUkFWSVRZX1JBTkdFX0ZBQ1RPUiA9IG9wdGlvbnMuZ3Jhdml0eVJhbmdlQ29tcG91bmQ7XG4gIGlmIChvcHRpb25zLmluaXRpYWxFbmVyZ3lPbkluY3JlbWVudGFsICE9IG51bGwpIENvU0VDb25zdGFudHMuREVGQVVMVF9DT09MSU5HX0ZBQ1RPUl9JTkNSRU1FTlRBTCA9IEZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfQ09PTElOR19GQUNUT1JfSU5DUkVNRU5UQUwgPSBvcHRpb25zLmluaXRpYWxFbmVyZ3lPbkluY3JlbWVudGFsO1xuXG4gIGlmIChvcHRpb25zLnF1YWxpdHkgPT0gJ2RyYWZ0JykgTGF5b3V0Q29uc3RhbnRzLlFVQUxJVFkgPSAwO2Vsc2UgaWYgKG9wdGlvbnMucXVhbGl0eSA9PSAncHJvb2YnKSBMYXlvdXRDb25zdGFudHMuUVVBTElUWSA9IDI7ZWxzZSBMYXlvdXRDb25zdGFudHMuUVVBTElUWSA9IDE7XG5cbiAgQ29TRUNvbnN0YW50cy5OT0RFX0RJTUVOU0lPTlNfSU5DTFVERV9MQUJFTFMgPSBGRExheW91dENvbnN0YW50cy5OT0RFX0RJTUVOU0lPTlNfSU5DTFVERV9MQUJFTFMgPSBMYXlvdXRDb25zdGFudHMuTk9ERV9ESU1FTlNJT05TX0lOQ0xVREVfTEFCRUxTID0gb3B0aW9ucy5ub2RlRGltZW5zaW9uc0luY2x1ZGVMYWJlbHM7XG4gIENvU0VDb25zdGFudHMuREVGQVVMVF9JTkNSRU1FTlRBTCA9IEZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfSU5DUkVNRU5UQUwgPSBMYXlvdXRDb25zdGFudHMuREVGQVVMVF9JTkNSRU1FTlRBTCA9ICFvcHRpb25zLnJhbmRvbWl6ZTtcbiAgQ29TRUNvbnN0YW50cy5BTklNQVRFID0gRkRMYXlvdXRDb25zdGFudHMuQU5JTUFURSA9IExheW91dENvbnN0YW50cy5BTklNQVRFID0gb3B0aW9ucy5hbmltYXRlO1xuICBDb1NFQ29uc3RhbnRzLlRJTEUgPSBvcHRpb25zLnRpbGU7XG4gIENvU0VDb25zdGFudHMuVElMSU5HX1BBRERJTkdfVkVSVElDQUwgPSB0eXBlb2Ygb3B0aW9ucy50aWxpbmdQYWRkaW5nVmVydGljYWwgPT09ICdmdW5jdGlvbicgPyBvcHRpb25zLnRpbGluZ1BhZGRpbmdWZXJ0aWNhbC5jYWxsKCkgOiBvcHRpb25zLnRpbGluZ1BhZGRpbmdWZXJ0aWNhbDtcbiAgQ29TRUNvbnN0YW50cy5USUxJTkdfUEFERElOR19IT1JJWk9OVEFMID0gdHlwZW9mIG9wdGlvbnMudGlsaW5nUGFkZGluZ0hvcml6b250YWwgPT09ICdmdW5jdGlvbicgPyBvcHRpb25zLnRpbGluZ1BhZGRpbmdIb3Jpem9udGFsLmNhbGwoKSA6IG9wdGlvbnMudGlsaW5nUGFkZGluZ0hvcml6b250YWw7XG59O1xuXG5fQ29TRUxheW91dC5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICB2YXIgcmVhZHk7XG4gIHZhciBmcmFtZUlkO1xuICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgdmFyIGlkVG9MTm9kZSA9IHRoaXMuaWRUb0xOb2RlID0ge307XG4gIHZhciBsYXlvdXQgPSB0aGlzLmxheW91dCA9IG5ldyBDb1NFTGF5b3V0KCk7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBzZWxmLnN0b3BwZWQgPSBmYWxzZTtcblxuICB0aGlzLmN5ID0gdGhpcy5vcHRpb25zLmN5O1xuXG4gIHRoaXMuY3kudHJpZ2dlcih7IHR5cGU6ICdsYXlvdXRzdGFydCcsIGxheW91dDogdGhpcyB9KTtcblxuICB2YXIgZ20gPSBsYXlvdXQubmV3R3JhcGhNYW5hZ2VyKCk7XG4gIHRoaXMuZ20gPSBnbTtcblxuICB2YXIgbm9kZXMgPSB0aGlzLm9wdGlvbnMuZWxlcy5ub2RlcygpO1xuICB2YXIgZWRnZXMgPSB0aGlzLm9wdGlvbnMuZWxlcy5lZGdlcygpO1xuXG4gIHRoaXMucm9vdCA9IGdtLmFkZFJvb3QoKTtcbiAgdGhpcy5wcm9jZXNzQ2hpbGRyZW5MaXN0KHRoaXMucm9vdCwgdGhpcy5nZXRUb3BNb3N0Tm9kZXMobm9kZXMpLCBsYXlvdXQpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZWRnZSA9IGVkZ2VzW2ldO1xuICAgIHZhciBzb3VyY2VOb2RlID0gdGhpcy5pZFRvTE5vZGVbZWRnZS5kYXRhKFwic291cmNlXCIpXTtcbiAgICB2YXIgdGFyZ2V0Tm9kZSA9IHRoaXMuaWRUb0xOb2RlW2VkZ2UuZGF0YShcInRhcmdldFwiKV07XG4gICAgaWYgKHNvdXJjZU5vZGUgIT09IHRhcmdldE5vZGUgJiYgc291cmNlTm9kZS5nZXRFZGdlc0JldHdlZW4odGFyZ2V0Tm9kZSkubGVuZ3RoID09IDApIHtcbiAgICAgIHZhciBlMSA9IGdtLmFkZChsYXlvdXQubmV3RWRnZSgpLCBzb3VyY2VOb2RlLCB0YXJnZXROb2RlKTtcbiAgICAgIGUxLmlkID0gZWRnZS5pZCgpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBnZXRQb3NpdGlvbnMgPSBmdW5jdGlvbiBnZXRQb3NpdGlvbnMoZWxlLCBpKSB7XG4gICAgaWYgKHR5cGVvZiBlbGUgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIGVsZSA9IGk7XG4gICAgfVxuICAgIHZhciB0aGVJZCA9IGVsZS5kYXRhKCdpZCcpO1xuICAgIHZhciBsTm9kZSA9IHNlbGYuaWRUb0xOb2RlW3RoZUlkXTtcblxuICAgIHJldHVybiB7XG4gICAgICB4OiBsTm9kZS5nZXRSZWN0KCkuZ2V0Q2VudGVyWCgpLFxuICAgICAgeTogbE5vZGUuZ2V0UmVjdCgpLmdldENlbnRlclkoKVxuICAgIH07XG4gIH07XG5cbiAgLypcbiAgICogUmVwb3NpdGlvbiBub2RlcyBpbiBpdGVyYXRpb25zIGFuaW1hdGVkbHlcbiAgICovXG4gIHZhciBpdGVyYXRlQW5pbWF0ZWQgPSBmdW5jdGlvbiBpdGVyYXRlQW5pbWF0ZWQoKSB7XG4gICAgLy8gVGhpZ3MgdG8gcGVyZm9ybSBhZnRlciBub2RlcyBhcmUgcmVwb3NpdGlvbmVkIG9uIHNjcmVlblxuICAgIHZhciBhZnRlclJlcG9zaXRpb24gPSBmdW5jdGlvbiBhZnRlclJlcG9zaXRpb24oKSB7XG4gICAgICBpZiAob3B0aW9ucy5maXQpIHtcbiAgICAgICAgb3B0aW9ucy5jeS5maXQob3B0aW9ucy5lbGVzLCBvcHRpb25zLnBhZGRpbmcpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXJlYWR5KSB7XG4gICAgICAgIHJlYWR5ID0gdHJ1ZTtcbiAgICAgICAgc2VsZi5jeS5vbmUoJ2xheW91dHJlYWR5Jywgb3B0aW9ucy5yZWFkeSk7XG4gICAgICAgIHNlbGYuY3kudHJpZ2dlcih7IHR5cGU6ICdsYXlvdXRyZWFkeScsIGxheW91dDogc2VsZiB9KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHRpY2tzUGVyRnJhbWUgPSBzZWxmLm9wdGlvbnMucmVmcmVzaDtcbiAgICB2YXIgaXNEb25lO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aWNrc1BlckZyYW1lICYmICFpc0RvbmU7IGkrKykge1xuICAgICAgaXNEb25lID0gc2VsZi5zdG9wcGVkIHx8IHNlbGYubGF5b3V0LnRpY2soKTtcbiAgICB9XG5cbiAgICAvLyBJZiBsYXlvdXQgaXMgZG9uZVxuICAgIGlmIChpc0RvbmUpIHtcbiAgICAgIC8vIElmIHRoZSBsYXlvdXQgaXMgbm90IGEgc3VibGF5b3V0IGFuZCBpdCBpcyBzdWNjZXNzZnVsIHBlcmZvcm0gcG9zdCBsYXlvdXQuXG4gICAgICBpZiAobGF5b3V0LmNoZWNrTGF5b3V0U3VjY2VzcygpICYmICFsYXlvdXQuaXNTdWJMYXlvdXQpIHtcbiAgICAgICAgbGF5b3V0LmRvUG9zdExheW91dCgpO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBsYXlvdXQgaGFzIGEgdGlsaW5nUG9zdExheW91dCBmdW5jdGlvbiBwcm9wZXJ0eSBjYWxsIGl0LlxuICAgICAgaWYgKGxheW91dC50aWxpbmdQb3N0TGF5b3V0KSB7XG4gICAgICAgIGxheW91dC50aWxpbmdQb3N0TGF5b3V0KCk7XG4gICAgICB9XG5cbiAgICAgIGxheW91dC5pc0xheW91dEZpbmlzaGVkID0gdHJ1ZTtcblxuICAgICAgc2VsZi5vcHRpb25zLmVsZXMubm9kZXMoKS5wb3NpdGlvbnMoZ2V0UG9zaXRpb25zKTtcblxuICAgICAgYWZ0ZXJSZXBvc2l0aW9uKCk7XG5cbiAgICAgIC8vIHRyaWdnZXIgbGF5b3V0c3RvcCB3aGVuIHRoZSBsYXlvdXQgc3RvcHMgKGUuZy4gZmluaXNoZXMpXG4gICAgICBzZWxmLmN5Lm9uZSgnbGF5b3V0c3RvcCcsIHNlbGYub3B0aW9ucy5zdG9wKTtcbiAgICAgIHNlbGYuY3kudHJpZ2dlcih7IHR5cGU6ICdsYXlvdXRzdG9wJywgbGF5b3V0OiBzZWxmIH0pO1xuXG4gICAgICBpZiAoZnJhbWVJZCkge1xuICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShmcmFtZUlkKTtcbiAgICAgIH1cblxuICAgICAgcmVhZHkgPSBmYWxzZTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgYW5pbWF0aW9uRGF0YSA9IHNlbGYubGF5b3V0LmdldFBvc2l0aW9uc0RhdGEoKTsgLy8gR2V0IHBvc2l0aW9ucyBvZiBsYXlvdXQgbm9kZXMgbm90ZSB0aGF0IGFsbCBub2RlcyBtYXkgbm90IGJlIGxheW91dCBub2RlcyBiZWNhdXNlIG9mIHRpbGluZ1xuXG4gICAgLy8gUG9zaXRpb24gbm9kZXMsIGZvciB0aGUgbm9kZXMgd2hvc2UgaWQgZG9lcyBub3QgaW5jbHVkZWQgaW4gZGF0YSAoYmVjYXVzZSB0aGV5IGFyZSByZW1vdmVkIGZyb20gdGhlaXIgcGFyZW50cyBhbmQgaW5jbHVkZWQgaW4gZHVtbXkgY29tcG91bmRzKVxuICAgIC8vIHVzZSBwb3NpdGlvbiBvZiB0aGVpciBhbmNlc3RvcnMgb3IgZHVtbXkgYW5jZXN0b3JzXG4gICAgb3B0aW9ucy5lbGVzLm5vZGVzKCkucG9zaXRpb25zKGZ1bmN0aW9uIChlbGUsIGkpIHtcbiAgICAgIGlmICh0eXBlb2YgZWxlID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgIGVsZSA9IGk7XG4gICAgICB9XG4gICAgICAvLyBJZiBlbGUgaXMgYSBjb21wb3VuZCBub2RlLCB0aGVuIGl0cyBwb3NpdGlvbiB3aWxsIGJlIGRlZmluZWQgYnkgaXRzIGNoaWxkcmVuXG4gICAgICBpZiAoIWVsZS5pc1BhcmVudCgpKSB7XG4gICAgICAgIHZhciB0aGVJZCA9IGVsZS5pZCgpO1xuICAgICAgICB2YXIgcE5vZGUgPSBhbmltYXRpb25EYXRhW3RoZUlkXTtcbiAgICAgICAgdmFyIHRlbXAgPSBlbGU7XG4gICAgICAgIC8vIElmIHBOb2RlIGlzIHVuZGVmaW5lZCBzZWFyY2ggdW50aWwgZmluZGluZyBwb3NpdGlvbiBkYXRhIG9mIGl0cyBmaXJzdCBhbmNlc3RvciAoSXQgbWF5IGJlIGR1bW15IGFzIHdlbGwpXG4gICAgICAgIHdoaWxlIChwTm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgcE5vZGUgPSBhbmltYXRpb25EYXRhW3RlbXAuZGF0YSgncGFyZW50JyldIHx8IGFuaW1hdGlvbkRhdGFbJ0R1bW15Q29tcG91bmRfJyArIHRlbXAuZGF0YSgncGFyZW50JyldO1xuICAgICAgICAgIGFuaW1hdGlvbkRhdGFbdGhlSWRdID0gcE5vZGU7XG4gICAgICAgICAgdGVtcCA9IHRlbXAucGFyZW50KClbMF07XG4gICAgICAgICAgaWYgKHRlbXAgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBOb2RlICE9IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogcE5vZGUueCxcbiAgICAgICAgICAgIHk6IHBOb2RlLnlcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiBlbGUucG9zaXRpb24oJ3gnKSxcbiAgICAgICAgICAgIHk6IGVsZS5wb3NpdGlvbigneScpXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgYWZ0ZXJSZXBvc2l0aW9uKCk7XG5cbiAgICBmcmFtZUlkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGl0ZXJhdGVBbmltYXRlZCk7XG4gIH07XG5cbiAgLypcbiAgKiBMaXN0ZW4gJ2xheW91dHN0YXJ0ZWQnIGV2ZW50IGFuZCBzdGFydCBhbmltYXRlZCBpdGVyYXRpb24gaWYgYW5pbWF0ZSBvcHRpb24gaXMgJ2R1cmluZydcbiAgKi9cbiAgbGF5b3V0LmFkZExpc3RlbmVyKCdsYXlvdXRzdGFydGVkJywgZnVuY3Rpb24gKCkge1xuICAgIGlmIChzZWxmLm9wdGlvbnMuYW5pbWF0ZSA9PT0gJ2R1cmluZycpIHtcbiAgICAgIGZyYW1lSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoaXRlcmF0ZUFuaW1hdGVkKTtcbiAgICB9XG4gIH0pO1xuXG4gIGxheW91dC5ydW5MYXlvdXQoKTsgLy8gUnVuIGNvc2UgbGF5b3V0XG5cbiAgLypcbiAgICogSWYgYW5pbWF0ZSBvcHRpb24gaXMgbm90ICdkdXJpbmcnICgnZW5kJyBvciBmYWxzZSkgcGVyZm9ybSB0aGVzZSBoZXJlIChJZiBpdCBpcyAnZHVyaW5nJyBzaW1pbGFyIHRoaW5ncyBhcmUgYWxyZWFkeSBwZXJmb3JtZWQpXG4gICAqL1xuICBpZiAodGhpcy5vcHRpb25zLmFuaW1hdGUgIT09IFwiZHVyaW5nXCIpIHtcbiAgICBzZWxmLm9wdGlvbnMuZWxlcy5ub2RlcygpLm5vdChcIjpwYXJlbnRcIikubGF5b3V0UG9zaXRpb25zKHNlbGYsIHNlbGYub3B0aW9ucywgZ2V0UG9zaXRpb25zKTsgLy8gVXNlIGxheW91dCBwb3NpdGlvbnMgdG8gcmVwb3NpdGlvbiB0aGUgbm9kZXMgaXQgY29uc2lkZXJzIHRoZSBvcHRpb25zIHBhcmFtZXRlclxuICAgIHJlYWR5ID0gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdGhpczsgLy8gY2hhaW5pbmdcbn07XG5cbi8vR2V0IHRoZSB0b3AgbW9zdCBvbmVzIG9mIGEgbGlzdCBvZiBub2Rlc1xuX0NvU0VMYXlvdXQucHJvdG90eXBlLmdldFRvcE1vc3ROb2RlcyA9IGZ1bmN0aW9uIChub2Rlcykge1xuICB2YXIgbm9kZXNNYXAgPSB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgIG5vZGVzTWFwW25vZGVzW2ldLmlkKCldID0gdHJ1ZTtcbiAgfVxuICB2YXIgcm9vdHMgPSBub2Rlcy5maWx0ZXIoZnVuY3Rpb24gKGVsZSwgaSkge1xuICAgIGlmICh0eXBlb2YgZWxlID09PSBcIm51bWJlclwiKSB7XG4gICAgICBlbGUgPSBpO1xuICAgIH1cbiAgICB2YXIgcGFyZW50ID0gZWxlLnBhcmVudCgpWzBdO1xuICAgIHdoaWxlIChwYXJlbnQgIT0gbnVsbCkge1xuICAgICAgaWYgKG5vZGVzTWFwW3BhcmVudC5pZCgpXSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50KClbMF07XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9KTtcblxuICByZXR1cm4gcm9vdHM7XG59O1xuXG5fQ29TRUxheW91dC5wcm90b3R5cGUucHJvY2Vzc0NoaWxkcmVuTGlzdCA9IGZ1bmN0aW9uIChwYXJlbnQsIGNoaWxkcmVuLCBsYXlvdXQpIHtcbiAgdmFyIHNpemUgPSBjaGlsZHJlbi5sZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgdmFyIHRoZUNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgdmFyIGNoaWxkcmVuX29mX2NoaWxkcmVuID0gdGhlQ2hpbGQuY2hpbGRyZW4oKTtcbiAgICB2YXIgdGhlTm9kZTtcblxuICAgIHZhciBkaW1lbnNpb25zID0gdGhlQ2hpbGQubGF5b3V0RGltZW5zaW9ucyh7XG4gICAgICBub2RlRGltZW5zaW9uc0luY2x1ZGVMYWJlbHM6IHRoaXMub3B0aW9ucy5ub2RlRGltZW5zaW9uc0luY2x1ZGVMYWJlbHNcbiAgICB9KTtcblxuICAgIGlmICh0aGVDaGlsZC5vdXRlcldpZHRoKCkgIT0gbnVsbCAmJiB0aGVDaGlsZC5vdXRlckhlaWdodCgpICE9IG51bGwpIHtcbiAgICAgIHRoZU5vZGUgPSBwYXJlbnQuYWRkKG5ldyBDb1NFTm9kZShsYXlvdXQuZ3JhcGhNYW5hZ2VyLCBuZXcgUG9pbnREKHRoZUNoaWxkLnBvc2l0aW9uKCd4JykgLSBkaW1lbnNpb25zLncgLyAyLCB0aGVDaGlsZC5wb3NpdGlvbigneScpIC0gZGltZW5zaW9ucy5oIC8gMiksIG5ldyBEaW1lbnNpb25EKHBhcnNlRmxvYXQoZGltZW5zaW9ucy53KSwgcGFyc2VGbG9hdChkaW1lbnNpb25zLmgpKSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGVOb2RlID0gcGFyZW50LmFkZChuZXcgQ29TRU5vZGUodGhpcy5ncmFwaE1hbmFnZXIpKTtcbiAgICB9XG4gICAgLy8gQXR0YWNoIGlkIHRvIHRoZSBsYXlvdXQgbm9kZVxuICAgIHRoZU5vZGUuaWQgPSB0aGVDaGlsZC5kYXRhKFwiaWRcIik7XG4gICAgLy8gQXR0YWNoIHRoZSBwYWRkaW5ncyBvZiBjeSBub2RlIHRvIGxheW91dCBub2RlXG4gICAgdGhlTm9kZS5wYWRkaW5nTGVmdCA9IHBhcnNlSW50KHRoZUNoaWxkLmNzcygncGFkZGluZycpKTtcbiAgICB0aGVOb2RlLnBhZGRpbmdUb3AgPSBwYXJzZUludCh0aGVDaGlsZC5jc3MoJ3BhZGRpbmcnKSk7XG4gICAgdGhlTm9kZS5wYWRkaW5nUmlnaHQgPSBwYXJzZUludCh0aGVDaGlsZC5jc3MoJ3BhZGRpbmcnKSk7XG4gICAgdGhlTm9kZS5wYWRkaW5nQm90dG9tID0gcGFyc2VJbnQodGhlQ2hpbGQuY3NzKCdwYWRkaW5nJykpO1xuXG4gICAgLy9BdHRhY2ggdGhlIGxhYmVsIHByb3BlcnRpZXMgdG8gY29tcG91bmQgaWYgbGFiZWxzIHdpbGwgYmUgaW5jbHVkZWQgaW4gbm9kZSBkaW1lbnNpb25zICBcbiAgICBpZiAodGhpcy5vcHRpb25zLm5vZGVEaW1lbnNpb25zSW5jbHVkZUxhYmVscykge1xuICAgICAgaWYgKHRoZUNoaWxkLmlzUGFyZW50KCkpIHtcbiAgICAgICAgdmFyIGxhYmVsV2lkdGggPSB0aGVDaGlsZC5ib3VuZGluZ0JveCh7IGluY2x1ZGVMYWJlbHM6IHRydWUsIGluY2x1ZGVOb2RlczogZmFsc2UgfSkudztcbiAgICAgICAgdmFyIGxhYmVsSGVpZ2h0ID0gdGhlQ2hpbGQuYm91bmRpbmdCb3goeyBpbmNsdWRlTGFiZWxzOiB0cnVlLCBpbmNsdWRlTm9kZXM6IGZhbHNlIH0pLmg7XG4gICAgICAgIHZhciBsYWJlbFBvcyA9IHRoZUNoaWxkLmNzcyhcInRleHQtaGFsaWduXCIpO1xuICAgICAgICB0aGVOb2RlLmxhYmVsV2lkdGggPSBsYWJlbFdpZHRoO1xuICAgICAgICB0aGVOb2RlLmxhYmVsSGVpZ2h0ID0gbGFiZWxIZWlnaHQ7XG4gICAgICAgIHRoZU5vZGUubGFiZWxQb3MgPSBsYWJlbFBvcztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNYXAgdGhlIGxheW91dCBub2RlXG4gICAgdGhpcy5pZFRvTE5vZGVbdGhlQ2hpbGQuZGF0YShcImlkXCIpXSA9IHRoZU5vZGU7XG5cbiAgICBpZiAoaXNOYU4odGhlTm9kZS5yZWN0LngpKSB7XG4gICAgICB0aGVOb2RlLnJlY3QueCA9IDA7XG4gICAgfVxuXG4gICAgaWYgKGlzTmFOKHRoZU5vZGUucmVjdC55KSkge1xuICAgICAgdGhlTm9kZS5yZWN0LnkgPSAwO1xuICAgIH1cblxuICAgIGlmIChjaGlsZHJlbl9vZl9jaGlsZHJlbiAhPSBudWxsICYmIGNoaWxkcmVuX29mX2NoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciB0aGVOZXdHcmFwaDtcbiAgICAgIHRoZU5ld0dyYXBoID0gbGF5b3V0LmdldEdyYXBoTWFuYWdlcigpLmFkZChsYXlvdXQubmV3R3JhcGgoKSwgdGhlTm9kZSk7XG4gICAgICB0aGlzLnByb2Nlc3NDaGlsZHJlbkxpc3QodGhlTmV3R3JhcGgsIGNoaWxkcmVuX29mX2NoaWxkcmVuLCBsYXlvdXQpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBAYnJpZWYgOiBjYWxsZWQgb24gY29udGludW91cyBsYXlvdXRzIHRvIHN0b3AgdGhlbSBiZWZvcmUgdGhleSBmaW5pc2hcbiAqL1xuX0NvU0VMYXlvdXQucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc3RvcHBlZCA9IHRydWU7XG5cbiAgcmV0dXJuIHRoaXM7IC8vIGNoYWluaW5nXG59O1xuXG52YXIgcmVnaXN0ZXIgPSBmdW5jdGlvbiByZWdpc3RlcihjeXRvc2NhcGUpIHtcbiAgLy8gIHZhciBMYXlvdXQgPSBnZXRMYXlvdXQoIGN5dG9zY2FwZSApO1xuXG4gIGN5dG9zY2FwZSgnbGF5b3V0JywgJ2Nvc2UtYmlsa2VudCcsIF9Db1NFTGF5b3V0KTtcbn07XG5cbi8vIGF1dG8gcmVnIGZvciBnbG9iYWxzXG5pZiAodHlwZW9mIGN5dG9zY2FwZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgcmVnaXN0ZXIoY3l0b3NjYXBlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSByZWdpc3RlcjtcblxuLyoqKi8gfSlcbi8qKioqKiovIF0pO1xufSk7IiwKICAgICJpbXBvcnQge1xuICBfX25hbWUsXG4gIGxvZ1xufSBmcm9tIFwiLi9jaHVuay1BR0hSQjRKRi5tanNcIjtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL2xheW91dC1hbGdvcml0aG1zL2Nvc2UtYmlsa2VudC9jeXRvc2NhcGUtc2V0dXAudHNcbmltcG9ydCBjeXRvc2NhcGUgZnJvbSBcImN5dG9zY2FwZVwiO1xuaW1wb3J0IGNvc2VCaWxrZW50IGZyb20gXCJjeXRvc2NhcGUtY29zZS1iaWxrZW50XCI7XG5pbXBvcnQgeyBzZWxlY3QgfSBmcm9tIFwiZDNcIjtcbmN5dG9zY2FwZS51c2UoY29zZUJpbGtlbnQpO1xuZnVuY3Rpb24gYWRkTm9kZXMobm9kZXMsIGN5KSB7XG4gIG5vZGVzLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICBjb25zdCBub2RlRGF0YSA9IHtcbiAgICAgIGlkOiBub2RlLmlkLFxuICAgICAgbGFiZWxUZXh0OiBub2RlLmxhYmVsLFxuICAgICAgaGVpZ2h0OiBub2RlLmhlaWdodCxcbiAgICAgIHdpZHRoOiBub2RlLndpZHRoLFxuICAgICAgcGFkZGluZzogbm9kZS5wYWRkaW5nID8/IDBcbiAgICB9O1xuICAgIE9iamVjdC5rZXlzKG5vZGUpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgaWYgKCFbXCJpZFwiLCBcImxhYmVsXCIsIFwiaGVpZ2h0XCIsIFwid2lkdGhcIiwgXCJwYWRkaW5nXCIsIFwieFwiLCBcInlcIl0uaW5jbHVkZXMoa2V5KSkge1xuICAgICAgICBub2RlRGF0YVtrZXldID0gbm9kZVtrZXldO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGN5LmFkZCh7XG4gICAgICBncm91cDogXCJub2Rlc1wiLFxuICAgICAgZGF0YTogbm9kZURhdGEsXG4gICAgICBwb3NpdGlvbjoge1xuICAgICAgICB4OiBub2RlLnggPz8gMCxcbiAgICAgICAgeTogbm9kZS55ID8/IDBcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5fX25hbWUoYWRkTm9kZXMsIFwiYWRkTm9kZXNcIik7XG5mdW5jdGlvbiBhZGRFZGdlcyhlZGdlcywgY3kpIHtcbiAgZWRnZXMuZm9yRWFjaCgoZWRnZSkgPT4ge1xuICAgIGNvbnN0IGVkZ2VEYXRhID0ge1xuICAgICAgaWQ6IGVkZ2UuaWQsXG4gICAgICBzb3VyY2U6IGVkZ2Uuc3RhcnQsXG4gICAgICB0YXJnZXQ6IGVkZ2UuZW5kXG4gICAgfTtcbiAgICBPYmplY3Qua2V5cyhlZGdlKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIGlmICghW1wiaWRcIiwgXCJzdGFydFwiLCBcImVuZFwiXS5pbmNsdWRlcyhrZXkpKSB7XG4gICAgICAgIGVkZ2VEYXRhW2tleV0gPSBlZGdlW2tleV07XG4gICAgICB9XG4gICAgfSk7XG4gICAgY3kuYWRkKHtcbiAgICAgIGdyb3VwOiBcImVkZ2VzXCIsXG4gICAgICBkYXRhOiBlZGdlRGF0YVxuICAgIH0pO1xuICB9KTtcbn1cbl9fbmFtZShhZGRFZGdlcywgXCJhZGRFZGdlc1wiKTtcbmZ1bmN0aW9uIGNyZWF0ZUN5dG9zY2FwZUluc3RhbmNlKGRhdGEpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgY29uc3QgcmVuZGVyRWwgPSBzZWxlY3QoXCJib2R5XCIpLmFwcGVuZChcImRpdlwiKS5hdHRyKFwiaWRcIiwgXCJjeVwiKS5hdHRyKFwic3R5bGVcIiwgXCJkaXNwbGF5Om5vbmVcIik7XG4gICAgY29uc3QgY3kgPSBjeXRvc2NhcGUoe1xuICAgICAgY29udGFpbmVyOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImN5XCIpLFxuICAgICAgLy8gY29udGFpbmVyIHRvIHJlbmRlciBpblxuICAgICAgc3R5bGU6IFtcbiAgICAgICAge1xuICAgICAgICAgIHNlbGVjdG9yOiBcImVkZ2VcIixcbiAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgXCJjdXJ2ZS1zdHlsZVwiOiBcImJlemllclwiXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSk7XG4gICAgcmVuZGVyRWwucmVtb3ZlKCk7XG4gICAgYWRkTm9kZXMoZGF0YS5ub2RlcywgY3kpO1xuICAgIGFkZEVkZ2VzKGRhdGEuZWRnZXMsIGN5KTtcbiAgICBjeS5ub2RlcygpLmZvckVhY2goZnVuY3Rpb24obikge1xuICAgICAgbi5sYXlvdXREaW1lbnNpb25zID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBub2RlRGF0YSA9IG4uZGF0YSgpO1xuICAgICAgICByZXR1cm4geyB3OiBub2RlRGF0YS53aWR0aCwgaDogbm9kZURhdGEuaGVpZ2h0IH07XG4gICAgICB9O1xuICAgIH0pO1xuICAgIGNvbnN0IGxheW91dENvbmZpZyA9IHtcbiAgICAgIG5hbWU6IFwiY29zZS1iaWxrZW50XCIsXG4gICAgICAvLyBAdHMtaWdub3JlIFR5cGVzIGZvciBjb3NlLWJpbGtlbnQgYXJlIG5vdCBjb3JyZWN0P1xuICAgICAgcXVhbGl0eTogXCJwcm9vZlwiLFxuICAgICAgc3R5bGVFbmFibGVkOiBmYWxzZSxcbiAgICAgIGFuaW1hdGU6IGZhbHNlXG4gICAgfTtcbiAgICBjeS5sYXlvdXQobGF5b3V0Q29uZmlnKS5ydW4oKTtcbiAgICBjeS5yZWFkeSgoZSkgPT4ge1xuICAgICAgbG9nLmluZm8oXCJDeXRvc2NhcGUgcmVhZHlcIiwgZSk7XG4gICAgICByZXNvbHZlKGN5KTtcbiAgICB9KTtcbiAgfSk7XG59XG5fX25hbWUoY3JlYXRlQ3l0b3NjYXBlSW5zdGFuY2UsIFwiY3JlYXRlQ3l0b3NjYXBlSW5zdGFuY2VcIik7XG5mdW5jdGlvbiBleHRyYWN0UG9zaXRpb25lZE5vZGVzKGN5KSB7XG4gIHJldHVybiBjeS5ub2RlcygpLm1hcCgobm9kZSkgPT4ge1xuICAgIGNvbnN0IGRhdGEgPSBub2RlLmRhdGEoKTtcbiAgICBjb25zdCBwb3NpdGlvbiA9IG5vZGUucG9zaXRpb24oKTtcbiAgICBjb25zdCBwb3NpdGlvbmVkTm9kZSA9IHtcbiAgICAgIGlkOiBkYXRhLmlkLFxuICAgICAgeDogcG9zaXRpb24ueCxcbiAgICAgIHk6IHBvc2l0aW9uLnlcbiAgICB9O1xuICAgIE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgaWYgKGtleSAhPT0gXCJpZFwiKSB7XG4gICAgICAgIHBvc2l0aW9uZWROb2RlW2tleV0gPSBkYXRhW2tleV07XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHBvc2l0aW9uZWROb2RlO1xuICB9KTtcbn1cbl9fbmFtZShleHRyYWN0UG9zaXRpb25lZE5vZGVzLCBcImV4dHJhY3RQb3NpdGlvbmVkTm9kZXNcIik7XG5mdW5jdGlvbiBleHRyYWN0UG9zaXRpb25lZEVkZ2VzKGN5KSB7XG4gIHJldHVybiBjeS5lZGdlcygpLm1hcCgoZWRnZSkgPT4ge1xuICAgIGNvbnN0IGRhdGEgPSBlZGdlLmRhdGEoKTtcbiAgICBjb25zdCByc2NyYXRjaCA9IGVkZ2UuX3ByaXZhdGUucnNjcmF0Y2g7XG4gICAgY29uc3QgcG9zaXRpb25lZEVkZ2UgPSB7XG4gICAgICBpZDogZGF0YS5pZCxcbiAgICAgIHNvdXJjZTogZGF0YS5zb3VyY2UsXG4gICAgICB0YXJnZXQ6IGRhdGEudGFyZ2V0LFxuICAgICAgc3RhcnRYOiByc2NyYXRjaC5zdGFydFgsXG4gICAgICBzdGFydFk6IHJzY3JhdGNoLnN0YXJ0WSxcbiAgICAgIG1pZFg6IHJzY3JhdGNoLm1pZFgsXG4gICAgICBtaWRZOiByc2NyYXRjaC5taWRZLFxuICAgICAgZW5kWDogcnNjcmF0Y2guZW5kWCxcbiAgICAgIGVuZFk6IHJzY3JhdGNoLmVuZFlcbiAgICB9O1xuICAgIE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgaWYgKCFbXCJpZFwiLCBcInNvdXJjZVwiLCBcInRhcmdldFwiXS5pbmNsdWRlcyhrZXkpKSB7XG4gICAgICAgIHBvc2l0aW9uZWRFZGdlW2tleV0gPSBkYXRhW2tleV07XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHBvc2l0aW9uZWRFZGdlO1xuICB9KTtcbn1cbl9fbmFtZShleHRyYWN0UG9zaXRpb25lZEVkZ2VzLCBcImV4dHJhY3RQb3NpdGlvbmVkRWRnZXNcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9sYXlvdXQtYWxnb3JpdGhtcy9jb3NlLWJpbGtlbnQvbGF5b3V0LnRzXG5hc3luYyBmdW5jdGlvbiBleGVjdXRlQ29zZUJpbGtlbnRMYXlvdXQoZGF0YSwgX2NvbmZpZykge1xuICBsb2cuZGVidWcoXCJTdGFydGluZyBjb3NlLWJpbGtlbnQgbGF5b3V0IGFsZ29yaXRobVwiKTtcbiAgdHJ5IHtcbiAgICB2YWxpZGF0ZUxheW91dERhdGEoZGF0YSk7XG4gICAgY29uc3QgY3kgPSBhd2FpdCBjcmVhdGVDeXRvc2NhcGVJbnN0YW5jZShkYXRhKTtcbiAgICBjb25zdCBwb3NpdGlvbmVkTm9kZXMgPSBleHRyYWN0UG9zaXRpb25lZE5vZGVzKGN5KTtcbiAgICBjb25zdCBwb3NpdGlvbmVkRWRnZXMgPSBleHRyYWN0UG9zaXRpb25lZEVkZ2VzKGN5KTtcbiAgICBsb2cuZGVidWcoYExheW91dCBjb21wbGV0ZWQ6ICR7cG9zaXRpb25lZE5vZGVzLmxlbmd0aH0gbm9kZXMsICR7cG9zaXRpb25lZEVkZ2VzLmxlbmd0aH0gZWRnZXNgKTtcbiAgICByZXR1cm4ge1xuICAgICAgbm9kZXM6IHBvc2l0aW9uZWROb2RlcyxcbiAgICAgIGVkZ2VzOiBwb3NpdGlvbmVkRWRnZXNcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZy5lcnJvcihcIkVycm9yIGluIGNvc2UtYmlsa2VudCBsYXlvdXQgYWxnb3JpdGhtOlwiLCBlcnJvcik7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cbl9fbmFtZShleGVjdXRlQ29zZUJpbGtlbnRMYXlvdXQsIFwiZXhlY3V0ZUNvc2VCaWxrZW50TGF5b3V0XCIpO1xuZnVuY3Rpb24gdmFsaWRhdGVMYXlvdXREYXRhKGRhdGEpIHtcbiAgaWYgKCFkYXRhKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTGF5b3V0IGRhdGEgaXMgcmVxdWlyZWRcIik7XG4gIH1cbiAgaWYgKCFkYXRhLmNvbmZpZykge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNvbmZpZ3VyYXRpb24gaXMgcmVxdWlyZWQgaW4gbGF5b3V0IGRhdGFcIik7XG4gIH1cbiAgaWYgKCFkYXRhLnJvb3ROb2RlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiUm9vdCBub2RlIGlzIHJlcXVpcmVkXCIpO1xuICB9XG4gIGlmICghZGF0YS5ub2RlcyB8fCAhQXJyYXkuaXNBcnJheShkYXRhLm5vZGVzKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIk5vIG5vZGVzIGZvdW5kIGluIGxheW91dCBkYXRhXCIpO1xuICB9XG4gIGlmICghQXJyYXkuaXNBcnJheShkYXRhLmVkZ2VzKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkVkZ2VzIGFycmF5IGlzIHJlcXVpcmVkIGluIGxheW91dCBkYXRhXCIpO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuX19uYW1lKHZhbGlkYXRlTGF5b3V0RGF0YSwgXCJ2YWxpZGF0ZUxheW91dERhdGFcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9sYXlvdXQtYWxnb3JpdGhtcy9jb3NlLWJpbGtlbnQvcmVuZGVyLnRzXG52YXIgcmVuZGVyID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyAoZGF0YTRMYXlvdXQsIHN2Zywge1xuICBpbnNlcnRDbHVzdGVyLFxuICBpbnNlcnRFZGdlLFxuICBpbnNlcnRFZGdlTGFiZWwsXG4gIGluc2VydE1hcmtlcnMsXG4gIGluc2VydE5vZGUsXG4gIGxvZzogbG9nMixcbiAgcG9zaXRpb25FZGdlTGFiZWxcbn0sIHsgYWxnb3JpdGhtOiBfYWxnb3JpdGhtIH0pID0+IHtcbiAgY29uc3Qgbm9kZURiID0ge307XG4gIGNvbnN0IGNsdXN0ZXJEYiA9IHt9O1xuICBjb25zdCBlbGVtZW50ID0gc3ZnLnNlbGVjdChcImdcIik7XG4gIGluc2VydE1hcmtlcnMoZWxlbWVudCwgZGF0YTRMYXlvdXQubWFya2VycywgZGF0YTRMYXlvdXQudHlwZSwgZGF0YTRMYXlvdXQuZGlhZ3JhbUlkKTtcbiAgY29uc3Qgc3ViR3JhcGhzRWwgPSBlbGVtZW50Lmluc2VydChcImdcIikuYXR0cihcImNsYXNzXCIsIFwic3ViZ3JhcGhzXCIpO1xuICBjb25zdCBlZGdlUGF0aHMgPSBlbGVtZW50Lmluc2VydChcImdcIikuYXR0cihcImNsYXNzXCIsIFwiZWRnZVBhdGhzXCIpO1xuICBjb25zdCBlZGdlTGFiZWxzID0gZWxlbWVudC5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImVkZ2VMYWJlbHNcIik7XG4gIGNvbnN0IG5vZGVzID0gZWxlbWVudC5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm5vZGVzXCIpO1xuICBsb2cyLmRlYnVnKFwiSW5zZXJ0aW5nIG5vZGVzIGludG8gRE9NIGZvciBkaW1lbnNpb24gY2FsY3VsYXRpb25cIik7XG4gIGF3YWl0IFByb21pc2UuYWxsKFxuICAgIGRhdGE0TGF5b3V0Lm5vZGVzLm1hcChhc3luYyAobm9kZSkgPT4ge1xuICAgICAgaWYgKG5vZGUuaXNHcm91cCkge1xuICAgICAgICBjb25zdCBjbHVzdGVyTm9kZSA9IHsgLi4ubm9kZSB9O1xuICAgICAgICBjbHVzdGVyRGJbbm9kZS5pZF0gPSBjbHVzdGVyTm9kZTtcbiAgICAgICAgbm9kZURiW25vZGUuaWRdID0gY2x1c3Rlck5vZGU7XG4gICAgICAgIGF3YWl0IGluc2VydENsdXN0ZXIoc3ViR3JhcGhzRWwsIG5vZGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgbm9kZVdpdGhQb3NpdGlvbiA9IHsgLi4ubm9kZSB9O1xuICAgICAgICBub2RlRGJbbm9kZS5pZF0gPSBub2RlV2l0aFBvc2l0aW9uO1xuICAgICAgICBjb25zdCBub2RlRWwgPSBhd2FpdCBpbnNlcnROb2RlKG5vZGVzLCBub2RlLCB7XG4gICAgICAgICAgY29uZmlnOiBkYXRhNExheW91dC5jb25maWcsXG4gICAgICAgICAgZGlyOiBkYXRhNExheW91dC5kaXJlY3Rpb24gfHwgXCJUQlwiXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBib3VuZGluZ0JveCA9IG5vZGVFbC5ub2RlKCkuZ2V0QkJveCgpO1xuICAgICAgICBub2RlV2l0aFBvc2l0aW9uLndpZHRoID0gYm91bmRpbmdCb3gud2lkdGg7XG4gICAgICAgIG5vZGVXaXRoUG9zaXRpb24uaGVpZ2h0ID0gYm91bmRpbmdCb3guaGVpZ2h0O1xuICAgICAgICBub2RlV2l0aFBvc2l0aW9uLmRvbUlkID0gbm9kZUVsO1xuICAgICAgICBsb2cyLmRlYnVnKGBOb2RlICR7bm9kZS5pZH0gZGltZW5zaW9uczogJHtib3VuZGluZ0JveC53aWR0aH14JHtib3VuZGluZ0JveC5oZWlnaHR9YCk7XG4gICAgICB9XG4gICAgfSlcbiAgKTtcbiAgbG9nMi5kZWJ1ZyhcIlJ1bm5pbmcgY29zZS1iaWxrZW50IGxheW91dCBhbGdvcml0aG1cIik7XG4gIGNvbnN0IHVwZGF0ZWRMYXlvdXREYXRhID0ge1xuICAgIC4uLmRhdGE0TGF5b3V0LFxuICAgIG5vZGVzOiBkYXRhNExheW91dC5ub2Rlcy5tYXAoKG5vZGUpID0+IHtcbiAgICAgIGNvbnN0IG5vZGVXaXRoRGltZW5zaW9ucyA9IG5vZGVEYltub2RlLmlkXTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLm5vZGUsXG4gICAgICAgIHdpZHRoOiBub2RlV2l0aERpbWVuc2lvbnMud2lkdGgsXG4gICAgICAgIGhlaWdodDogbm9kZVdpdGhEaW1lbnNpb25zLmhlaWdodFxuICAgICAgfTtcbiAgICB9KVxuICB9O1xuICBjb25zdCBsYXlvdXRSZXN1bHQgPSBhd2FpdCBleGVjdXRlQ29zZUJpbGtlbnRMYXlvdXQodXBkYXRlZExheW91dERhdGEsIGRhdGE0TGF5b3V0LmNvbmZpZyk7XG4gIGxvZzIuZGVidWcoXCJQb3NpdGlvbmluZyBub2RlcyBiYXNlZCBvbiBsYXlvdXQgcmVzdWx0c1wiKTtcbiAgbGF5b3V0UmVzdWx0Lm5vZGVzLmZvckVhY2goKHBvc2l0aW9uZWROb2RlKSA9PiB7XG4gICAgY29uc3Qgbm9kZSA9IG5vZGVEYltwb3NpdGlvbmVkTm9kZS5pZF07XG4gICAgaWYgKG5vZGU/LmRvbUlkKSB7XG4gICAgICBub2RlLmRvbUlkLmF0dHIoXG4gICAgICAgIFwidHJhbnNmb3JtXCIsXG4gICAgICAgIGB0cmFuc2xhdGUoJHtwb3NpdGlvbmVkTm9kZS54fSwgJHtwb3NpdGlvbmVkTm9kZS55fSlgXG4gICAgICApO1xuICAgICAgbm9kZS54ID0gcG9zaXRpb25lZE5vZGUueDtcbiAgICAgIG5vZGUueSA9IHBvc2l0aW9uZWROb2RlLnk7XG4gICAgICBsb2cyLmRlYnVnKGBQb3NpdGlvbmVkIG5vZGUgJHtub2RlLmlkfSBhdCBjZW50ZXIgKCR7cG9zaXRpb25lZE5vZGUueH0sICR7cG9zaXRpb25lZE5vZGUueX0pYCk7XG4gICAgfVxuICB9KTtcbiAgbGF5b3V0UmVzdWx0LmVkZ2VzLmZvckVhY2goKHBvc2l0aW9uZWRFZGdlKSA9PiB7XG4gICAgY29uc3QgZWRnZSA9IGRhdGE0TGF5b3V0LmVkZ2VzLmZpbmQoKGUpID0+IGUuaWQgPT09IHBvc2l0aW9uZWRFZGdlLmlkKTtcbiAgICBpZiAoZWRnZSkge1xuICAgICAgZWRnZS5wb2ludHMgPSBbXG4gICAgICAgIHsgeDogcG9zaXRpb25lZEVkZ2Uuc3RhcnRYLCB5OiBwb3NpdGlvbmVkRWRnZS5zdGFydFkgfSxcbiAgICAgICAgeyB4OiBwb3NpdGlvbmVkRWRnZS5taWRYLCB5OiBwb3NpdGlvbmVkRWRnZS5taWRZIH0sXG4gICAgICAgIHsgeDogcG9zaXRpb25lZEVkZ2UuZW5kWCwgeTogcG9zaXRpb25lZEVkZ2UuZW5kWSB9XG4gICAgICBdO1xuICAgIH1cbiAgfSk7XG4gIGxvZzIuZGVidWcoXCJJbnNlcnRpbmcgYW5kIHBvc2l0aW9uaW5nIGVkZ2VzXCIpO1xuICBhd2FpdCBQcm9taXNlLmFsbChcbiAgICBkYXRhNExheW91dC5lZGdlcy5tYXAoYXN5bmMgKGVkZ2UpID0+IHtcbiAgICAgIGNvbnN0IF9lZGdlTGFiZWwgPSBhd2FpdCBpbnNlcnRFZGdlTGFiZWwoZWRnZUxhYmVscywgZWRnZSk7XG4gICAgICBjb25zdCBzdGFydE5vZGUgPSBub2RlRGJbZWRnZS5zdGFydCA/PyBcIlwiXTtcbiAgICAgIGNvbnN0IGVuZE5vZGUgPSBub2RlRGJbZWRnZS5lbmQgPz8gXCJcIl07XG4gICAgICBpZiAoc3RhcnROb2RlICYmIGVuZE5vZGUpIHtcbiAgICAgICAgY29uc3QgcG9zaXRpb25lZEVkZ2UgPSBsYXlvdXRSZXN1bHQuZWRnZXMuZmluZCgoZSkgPT4gZS5pZCA9PT0gZWRnZS5pZCk7XG4gICAgICAgIGlmIChwb3NpdGlvbmVkRWRnZSkge1xuICAgICAgICAgIGxvZzIuZGVidWcoXCJBUEEwMSBwb3NpdGlvbmVkRWRnZVwiLCBwb3NpdGlvbmVkRWRnZSk7XG4gICAgICAgICAgY29uc3QgZWRnZVdpdGhQYXRoID0geyAuLi5lZGdlIH07XG4gICAgICAgICAgY29uc3QgcGF0aHMgPSBpbnNlcnRFZGdlKFxuICAgICAgICAgICAgZWRnZVBhdGhzLFxuICAgICAgICAgICAgZWRnZVdpdGhQYXRoLFxuICAgICAgICAgICAgY2x1c3RlckRiLFxuICAgICAgICAgICAgZGF0YTRMYXlvdXQudHlwZSxcbiAgICAgICAgICAgIHN0YXJ0Tm9kZSxcbiAgICAgICAgICAgIGVuZE5vZGUsXG4gICAgICAgICAgICBkYXRhNExheW91dC5kaWFncmFtSWRcbiAgICAgICAgICApO1xuICAgICAgICAgIHBvc2l0aW9uRWRnZUxhYmVsKGVkZ2VXaXRoUGF0aCwgcGF0aHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGVkZ2VXaXRoUGF0aCA9IHtcbiAgICAgICAgICAgIC4uLmVkZ2UsXG4gICAgICAgICAgICBwb2ludHM6IFtcbiAgICAgICAgICAgICAgeyB4OiBzdGFydE5vZGUueCB8fCAwLCB5OiBzdGFydE5vZGUueSB8fCAwIH0sXG4gICAgICAgICAgICAgIHsgeDogZW5kTm9kZS54IHx8IDAsIHk6IGVuZE5vZGUueSB8fCAwIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9O1xuICAgICAgICAgIGNvbnN0IHBhdGhzID0gaW5zZXJ0RWRnZShcbiAgICAgICAgICAgIGVkZ2VQYXRocyxcbiAgICAgICAgICAgIGVkZ2VXaXRoUGF0aCxcbiAgICAgICAgICAgIGNsdXN0ZXJEYixcbiAgICAgICAgICAgIGRhdGE0TGF5b3V0LnR5cGUsXG4gICAgICAgICAgICBzdGFydE5vZGUsXG4gICAgICAgICAgICBlbmROb2RlLFxuICAgICAgICAgICAgZGF0YTRMYXlvdXQuZGlhZ3JhbUlkXG4gICAgICAgICAgKTtcbiAgICAgICAgICBwb3NpdGlvbkVkZ2VMYWJlbChlZGdlV2l0aFBhdGgsIHBhdGhzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICk7XG4gIGxvZzIuZGVidWcoXCJDb3NlLWJpbGtlbnQgcmVuZGVyaW5nIGNvbXBsZXRlZFwiKTtcbn0sIFwicmVuZGVyXCIpO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvbGF5b3V0LWFsZ29yaXRobXMvY29zZS1iaWxrZW50L2luZGV4LnRzXG52YXIgcmVuZGVyMiA9IHJlbmRlcjtcbmV4cG9ydCB7XG4gIHJlbmRlcjIgYXMgcmVuZGVyXG59O1xuIgogIF0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7O0dBQUMsU0FB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LElBQUksZ0JBQWdCO0FBQUEsUUFDbEIsS0FBSyxNQUFNLHdCQUF3QixjQUFjO0FBQUEsUUFDakQsTUFBTSxlQUFlLEtBQUssS0FBSztBQUFBLFFBQy9CLE1BQU0sUUFBUSxXQUNaLFdBQ0EsY0FDQSxXQUNBLFlBQVksTUFDWixXQUNBLFNBQ0EsWUFBWSxTQUNkO0FBQUEsUUFDQSxrQkFBa0IsY0FBYyxLQUFLO0FBQUEsTUFDdkMsRUFBTztBQUFBLFFBQ0wsTUFBTSxlQUFlO0FBQUEsYUFDaEI7QUFBQSxVQUNILFFBQVE7QUFBQSxZQUNOLEVBQUUsR0FBRyxVQUFVLEtBQUssR0FBRyxHQUFHLFVBQVUsS0FBSyxFQUFFO0FBQUEsWUFDM0MsRUFBRSxHQUFHLFFBQVEsS0FBSyxHQUFHLEdBQUcsUUFBUSxLQUFLLEVBQUU7QUFBQSxVQUN6QztBQUFBLFFBQ0Y7QUFBQSxRQUNBLE1BQU0sUUFBUSxXQUNaLFdBQ0EsY0FDQSxXQUNBLFlBQVksTUFDWixXQUNBLFNBQ0EsWUFBWSxTQUNkO0FBQUEsUUFDQSxrQkFBa0IsY0FBYyxLQUFLO0FBQUE7QUFBQSxJQUV6QztBQUFBLEdBQ0QsQ0FDSDtBQUFBLEVBQ0EsS0FBSyxNQUFNLGtDQUFrQztBQUFBLEdBQzVDLFFBQVE7QUFHWCxJQUFJLFVBQVU7IiwKICAiZGVidWdJZCI6ICI5RTkyNkYyQTQyOTU2ODA2NjQ3NTZFMjE2NDc1NkUyMSIsCiAgIm5hbWVzIjogW10KfQ==
