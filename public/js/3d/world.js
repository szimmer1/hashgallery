(function(window, THREE) {

    var PI = Math.PI;

    function World(w,h) {
        this.width = w;
        this.height = h;
        this.pMaterials = {
            'basic' : THREE.MeshBasicMaterial,
            'phong' : THREE.MeshPhongMaterial
        };
        this.pLights = {
            'directional' : THREE.DirectionalLight,
            'point' : THREE.PointLight,
            'hemisphere' : THREE.HemisphereLight,
            'spotlight' : THREE.SpotLight
        };
        this.lights = {
        };
        this.materials = {
        };
        this.geometries = {
        };
        this.objects = {
        };
        this.dWall = 14.0;
        this.scene = new THREE.Scene();
        this.cameras = [];
        this.currentCamera = 0;
        this.renderer = new THREE.WebGLRenderer();
        this.clock = new THREE.Clock();
        THREE.ImageUtils.crossOrigin = '';

        this.setup();
    }

    World.prototype = {
        setDim : function(w, h) {
            this.width = w;
            this.height = h;

            this.cameras.forEach(function(camera) {
                camera.aspect = w/h;
                camera.updateProjectionMatrix();
            });
            this.renderer.setSize(w, h);
        },

        getDomElement : function() {
            return this.renderer.domElement;
        },

        addCamera : function(params, flyControls) {
            var newCam = new THREE.PerspectiveCamera(params.fov, params.aspect, params.near, params.far);
            if (flyControls) {
                newCam.controls = new THREE.OrbitControls( newCam, this.getDomElement() );
                newCam.controls.movementSpeed = 1000;
                newCam.controls.rollSpeed = Math.PI/6;
                newCam.controls.autoForward = false;
                newCam.controls.dragToLook = false;
            }
            this.cameras.push(newCam)

        },

        moveCamera : function(idx, pos, y, z) {
            if (Array.isArray(pos)) {
                this.cameras[idx].position.x = pos[0];
                this.cameras[idx].position.y = pos[1];
                this.cameras[idx].position.z = pos[2];
            }
            else {
                this.cameras[idx].position.x = pos[pos];
                this.cameras[idx].position.y = pos[y];
                this.cameras[idx].position.z = pos[z];
            }
        },

        addLight : function(name, type, mesh, params, settings) {
            var self = this;

            if (self.lights[name]) {
                alert('light already exists');
            }
            else if (type in self.pLights) {
                this.lights[name] = construct('apply', self.pLights[type], _.map(params));
                if (settings && settings.position) {
                    this.lights[name].position.set(settings.position[0], settings.position[1], settings.position[2])
                }
                if (settings && settings.target) {
                    this.lights[name].target.position.set(settings.target[0], settings.target[1], settings.target[2])
                }
                if (mesh && mesh.model) this.lights[name].add( mesh.model );
                if (mesh && mesh.group) {
                    mesh.group.add(this.lights[name])
                }
                else {
                    this.add(self.lights[name])
                }
            }
            else {
                alert('unknown light type')
            }

            return self;
        },

        addMaterial : function(name, type, params) {
            var self = this;

            if (type in self.pMaterials) {
                this.materials[name] = construct('call', self.pMaterials[type], params)
            }
            else {
                alert('unknown material type')
            }

            return self;
        },

        addMesh :function(name, geo, mat, group, transformations) {
            this.objects[name] = new THREE.Mesh(geo, mat);
                if (transformations && transformations.rotation) {
                    this.objects[name].rotation.set( transformations.rotation[0], transformations.rotation[1], transformations.rotation[2])
                }
                if (transformations && transformations.scale) {
                    this.objects[name].scale.set( transformations.scale[0], transformations.scale[1], transformations.scale[2])
                }
                if (transformations && transformations.position) {
                    this.objects[name].position.set( transformations.position[0], transformations.position[1], transformations.position[2])
                }
            return this.add(this.objects[name], group);
        },

        add : function(mesh, group) {
            if (group) {
                group.add(mesh)
            }
            else {
                this.scene.add(mesh);
            }
            return this;
        },

        addShape : function( name, shape, material, group, params, extrude ) {
            var self = this;

            var geometry;
            if (!self.materials[material]) {
                window.alert('material doesn\'t exist');
                return;
            }
            if (extrude) {
                geometry = new THREE.ExtrudeGeometry( shape, extrude )
            }
            else {
                geometry = new THREE.ShapeGeometry( shape )
            }
            self.addMesh(name, geometry, self.materials[material], group, params);
            return self;
        },

        addPicture : function(name, url, dim, transformations, successCallback, errorCallback) {
            var maxWidth = 8;
            var maxHeight = 10;
            if (dim && dim.width) {
                var width = dim.width > dim.height ? 0 : 1;
            }

            var image = THREE.ImageUtils.loadTexture(url, THREE.UVMapping, successCallback, errorCallback);
            image.needsUpdate = true;
            image.minFilter = THREE.NearestFilter;
            var texMat = new THREE.MeshBasicMaterial( { map: image } );

            this.objects[name] = new THREE.Mesh( new THREE.PlaneGeometry(8,10), texMat );
            if (transformations && transformations.rotation) {
                this.objects[name].rotation.set( transformations.rotation[0], transformations.rotation[1], transformations.rotation[2])
            }
            if (transformations && transformations.scale) {
                this.objects[name].scale.set( transformations.scale[0], transformations.scale[1], transformations.scale[2])
            }
            if (transformations && transformations.position) {
                this.objects[name].position.set( transformations.position[0], transformations.position[1], transformations.position[2])
            }
            else if (!transformations) {
                debugger;c
                this.objects[name].position.y = 7;
                switch (name.charAt(name.length-1)) {
                    case '0':
                        this.objects[name].position.z = -this.dWall-0.5;
                        break;
                    case '1':
                        this.objects[name].rotation.set(0, PI/2, 0);
                        this.objects[name].position.x = this.dWall+0.5;
                    case '2':
                        this.objects[name].rotation.set(0, PI, 0);
                        this.objects[name].position.z = this.dWall+0.5;
                    case '3':
                        this.objects[name].rotation.set(0, PI/2, 0);
                        this.objects[name].position.z = this.dWall+0.5;
                    default:
                        break;
                }
            }

            this.add(this.objects[name])
        },

        rectangleShape : function(vert, horiz) {
            if (!horiz) {
                horiz = vert;
            }
            vert /= 2;
            horiz /= 2;

            var shape = new THREE.Shape();
            shape.moveTo(-horiz, -vert);
            shape.lineTo(horiz, -vert);
            shape.lineTo(horiz, vert);
            shape.lineTo(-horiz, vert);
            shape.lineTo(-horiz,-vert);
            return shape;
        },

        setup : function() {
            var self = this;

            this.setDim(self.width, self.height);

            this.add(buildAxes(100.0));

            this.scene.fog = new THREE.Fog(0x00000f, 20, 100);
            this.renderer.setClearColor( self.scene.fog.color );

            this.addLight('hemi', 'hemisphere', null, {sky:0xffffff, ground:0x00ff00, intensity:0.5});

            this.addMaterial('phong_yellow', 'phong', {color:0xffff00, side: THREE.DoubleSide});
            this.addMaterial('phong_green', 'phong', {color:0x00ff00, side: THREE.DoubleSide});

            var room = new THREE.Object3D();

            this.addShape('floor', self.rectangleShape(500, 500), 'phong_green', room, {
                rotation:[PI/2, 0, 0]
            });
            this.addShape('wall0', self.rectangleShape(15, 10), 'phong_green', room, {
                position:[-15, 7.5, 0],
                rotation:[0, PI/2, 0]
            }, { amount: 0.1, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.5, bevelThickness: 0.1 });
            this.addShape('wall1', self.rectangleShape(15, 10), 'phong_green', room, {
                position:[0, 7.5, -15]
            }, { amount: 0.1, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.5, bevelThickness: 0.1 });
            this.addShape('wall2', self.rectangleShape(15, 10), 'phong_green', room, {
                position:[15, 7.5, 0],
                rotation:[0, PI/2, 0]
            }, { amount: 0.1, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.5, bevelThickness: 0.1 });
            this.addShape('wall3', self.rectangleShape(15, 10), 'phong_green', room, {
                position:[0, 7.5, 15]
            }, { amount: 0.1, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.5, bevelThickness: 0.1 });

            var walllight = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), new THREE.MeshBasicMaterial({color: 0xffffff}));

            var dWall = this.dWall;
            var wall0light = walllight.clone();
            wall0light.position.set(-dWall, 13, 0);
            var wall1light = walllight.clone();
            wall1light.position.set(0, 13, -dWall);
            var wall2light = walllight.clone();
            wall2light.position.set(dWall, 13, 0);
            var wall3light = walllight.clone();
            wall3light.position.set(0, 13, dWall);

            this.addLight('wall0light', 'point', {model:wall0light},{color: 0xffffff, intensity: 0.8});
            this.addLight('wall1light', 'point', {model:wall1light},{color: 0xffffff, intensity: 0.8});
            this.addLight('wall2light', 'point', {model:wall2light},{color: 0xffffff, intensity: 0.8});
            this.addLight('wall3light', 'point', {model:wall3light},{color: 0xffffff, intensity: 0.8});

            this.add(room);

            // set camera
            this.addCamera({
                fov: 75,
                aspect: self.width/self.height,
                near: 0.1,
                far : 1000.0
            }, true);
            this.moveCamera(0, [0,10,5]);
        }
    }

    window.World = World;


    /**
     * Helpers
     */

    function construct(method, constructor, args) {
        var F = function () {
            return method === 'apply' ? constructor.apply(this, args) : constructor.call(this, args)
        };

        F.prototype = constructor.prototype;
        return new F();
    }

    function buildAxes ( length ) {
        var axes = new THREE.Object3D();

        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z

        return axes;

    }

    function buildAxis( src, dst, colorHex, dashed ) {
        var geom = new THREE.Geometry(),
            mat;

        if(dashed) {
            mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
        } else {
            mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
        }

        geom.vertices.push( src.clone() );
        geom.vertices.push( dst.clone() );
        geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

        var axis = new THREE.Line( geom, mat, THREE.LinePieces );

        return axis;

    }

})(window, THREE);
