(function(R) {
    var points = [
            { x: 50, y: 50 },
            { x: 150, y: 50 },
            { x: 250, y: 50 },
            { x: 350, y: 50 },
            { x: 50, y: 350 },
            { x: 150, y: 350 },
            { x: 250, y: 350 },
            { x: 350, y: 350 },
            { x: 50, y: 150 },
            { x: 50, y: 250 },
            { x: 350, y: 150 },
            { x: 350, y: 250 }
        ];

    function dragStart(x, y, e) {
        if(this.animating) {
            this.already_animating = true;
            return;
        }
        this.already_animating = false;
        this.animating = true;
        this.current_transform = this.transform();
    }

    function dragMove(dx, dy, x, y, e) {
        if(this.already_animating) return;
        this.transform(this.current_transform+'T'+dx+','+dy)
            .updatePaths();
    }

    function dragEnd(e) {
        if(this.already_animating) return;
        
        var that = this;

        this.animate({
          transform: this.original_transform
        }, 500, 'bounce', function() {
           that.animating = false;
        });

        var animation = setInterval(function() {
            that.updatePaths();
            if(!that.animating) {
                clearTimeout(animation);
            }
        }, 8);

        this.current_transform = this.transform();
    }

    function getPathString(obj1, obj2) {
        var w1 = obj1.node.width.baseVal.value;
        var h1 = obj1.node.height.baseVal.value;
        var x1 = obj1.matrix.e;
        var y1 = obj1.matrix.f;
        var w2 = obj2.node.width.baseVal.value;
        var h2 = obj2.node.height.baseVal.value;
        var x2 = obj2.matrix.e;
        var y2 = obj2.matrix.f;
        return "M"+(x1+(w1/2))+","+(y1+(h1/2))+"L"+(x2+(w2/2))+","+(y2+(h2/2));
    }

    R.el.addPath = function(obj) {
        this.paths = this.paths || {};
        obj.paths = obj.paths || {};

        if(this.paths[obj.id] == null) {
            var path = this.paper.path(getPathString(this, obj))
                .attr({
                    stroke: '#FFF',
                    'stroke-dasharray': '',
                    'stroke-width': 3
                }).toBack();

            this.paths[obj.id] = {
                path: path,
                obj: obj
            };

            obj.paths[this.id] = {
                path: path,
                obj: this
            };
        }
    }

    R.el.updatePaths = function() {
        for(var k in this.paths) {
            this.paths[k].path.attr(
                {
                    "path" : getPathString(this, this.paths[k].obj)
                }
            ).toBack();
        }
    }

    R.el.updatePathDash = function(dash) {
        for(var k in this.paths) {
            var d = dash;
            this.paths[k].path.attr(
                {
                    "stroke-dasharray": d
                }
            ).toBack();
        }
    }

    R.el.updatePathWidth = function(width) {
        for(var k in this.paths) {
            this.paths[k].path.attr(
                {
                    "stroke-width": width
                }
            ).toBack();
        }
    }

    R.el.init = function(x, y) {
        x = x || 0;
        y = y || 0;
        this.paths = {};
        this.drag(dragMove, dragStart, dragEnd);
        this.transform("T"+x+","+y);
        this.original_transform = this.transform();
        return this;
    }

    window.onload = function() {
        var paper = new R('canvas', '100%', '100%');
        var r1 = paper.rect(0, 0, 50, 50).attr({
            fill: '#F00'
        }).init(200, 200);

        r1.id = "id" + r1.id;

        for (var i = 0; i < points.length; i++) {
            var sqr = paper.rect(0, 0, 50, 50).attr({
                fill: '#F00'
            }).init(points[i].x, points[i].y);
            sqr.id = "id" + sqr.id;
            r1.addPath(sqr);
        }

        var prev = null;
        var rad = document.getElementsByName('dashes');
        for(var i = 0; i < rad.length; i++) {
            rad[i].onclick = function() {
                if(this !== prev) {
                    prev = this;
                }
                r1.updatePathDash(this.value);
            };
        }

        var strokeSize = document.getElementsByName('strokeSize')[0];
        strokeSize.addEventListener('input', function() {
            strokeSize.value = (strokeSize.value < 16) ? strokeSize.value : 15;
            strokeSize.value = (strokeSize.value > 0) ? strokeSize.value : 1;
            r1.updatePathWidth(strokeSize.value);
        });
    }

})(Raphael);
