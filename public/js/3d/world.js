(function(window, THREE) {

    var PI = Math.PI;

    function World(w,h) {
        THREE.crossOrigin = "";
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
        this.wallRotation = [
            [0,3 * PI/2,0],
            [0,PI,0],
            [0,PI/2,0],
            [0,PI,0]
        ];
        this.wallTranslate = [
            [20, 7.5, 0],
            [0, 7.5, 20],
            [-20, 7.5, 0],
            [0, 7.5, -20]
        ];
        this.dWall = 14.0;
        this.scene = new THREE.Scene();
        this.cameras = [];
        this.currentCamera = 0;
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.shadowMapEnabled = true;
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

        moveCamera : function(idx, pos, lookAt) {
            var c = this.cameras[idx];
            if (Array.isArray(pos)) {
                c.position.x = pos[0];
                c.position.y = pos[1];
                c.position.z = pos[2];
            }
            if (Array.isArray(lookAt)) {
                c.up = new THREE.Vector3(0,1,0);
                c.lookAt(new THREE.Vector3(lookAt[0], lookAt[1], lookAt[2]))
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
            var self = this;

            var maxWidth = 20;
            var maxHeight = 12;
            var w = 10;
            var h = 10;
            if (dim && dim.width) {
                var r = dim.width / dim.height;
                if (dim.width > dim.height) {
                    w = maxWidth;
                    do {
                        h = 1 / r * w;
                        w -= 0.1;
                    } while (h > maxHeight)
                }
                else {
                    h = maxHeight;
                    do {
                        w = r * maxHeight;
                        h -= 0.1;
                    } while (w > maxWidth);
                }
            }

            var image = THREE.ImageUtils.loadTexture(url, THREE.UVMapping, successCallback, errorCallback);
            var smap = THREE.ImageUtils.loadTexture("/hide_tex.jpg", {}, function(){});
            image.needsUpdate = true;
            image.minFilter = THREE.NearestFilter;
            var texMat = new THREE.MeshPhongMaterial( {
                map: image,
                emissive : 0x000000,
                color : 0xffffff,
                spectral : 0xc0c0c0,
                bumpMap : smap,
                bumpScale : 0.025
            } );

            this.objects[name] = new THREE.Mesh( new THREE.PlaneGeometry(w,h), texMat );

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
                switch (name.charAt(name.length-1)) {
                    case '0':
                        this.objects[name].rotation.set(self.wallRotation[0][0], self.wallRotation[0][1], self.wallRotation[0][2]);
                        this.objects[name].position.set(self.wallTranslate[0][0] - 0.2, self.wallTranslate[0][1], self.wallTranslate[0][2]);
                        break;
                    case '1':
                        this.objects[name].rotation.set(self.wallRotation[1][0], self.wallRotation[1][1], self.wallRotation[1][2]);
                        this.objects[name].position.set(self.wallTranslate[1][0], self.wallTranslate[1][1], self.wallTranslate[1][2] - 0.2);
                        break;
                    case '2':
                        this.objects[name].rotation.set(self.wallRotation[2][0], self.wallRotation[2][1], self.wallRotation[2][2]);
                        this.objects[name].position.set(self.wallTranslate[2][0] + 0.2, self.wallTranslate[2][1], self.wallTranslate[2][2]);
                        break;
                    case '3':
                        this.objects[name].rotation.set(self.wallRotation[3][0], self.wallRotation[3][1], self.wallRotation[3][2]);
                        this.objects[name].position.set(self.wallTranslate[3][0], self.wallTranslate[3][1], self.wallTranslate[3][2] + 0.2);
                        break;
                    default:
                        break;
                }
            }

            var spotlight = new THREE.SpotLight(0xffffff);
            spotlight.position.set(0,2,0);
            var picObject = new THREE.Object3D();
            //picObject.add(this.objects[name]);
            this.scene.add(spotlight);
            this.add(this.objects[name]);
            spotlight.target = this.objects[name];
        },

        handleKeyPress : function(event, callback) {
            debugger;
            switch (event.charCode) {
                case 49: // 1
                    this.lookAtWall(0, callback);
                    break;
                case 50: // 2
                    this.lookAtWall(1, callback);
                    break;
                case 51: // 3
                    this.lookAtWall(2, callback);
                    break;
                case 52: // 4
                    this.lookAtWall(3, callback);
                    break;
            }
        },

        lookAtWall : function(wall, callback) {
            var err,
                data = wall + 1;
            switch (wall) {
                case 0:
                    this.moveCamera(0, [-10, 6, 0], [-20, 6, 0]);
                    break;
                case 1:
                    this.moveCamera(0, [0, 6, -10], [0, 6, -20]);
                    break;
                case 2:
                    this.moveCamera(0, [10, 6, 0], [20, 6, 0]);
                    break;
                case 3:
                    this.moveCamera(0, [0, 6, 10], [0, 6, 20]);
                    break;
            }
            callback(err,data);
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

        buildSkybox : function(boxsize) {
            var fileNames = ['xpos.jpg', 'xneg.jpg', 'ypos.jpg', 'hide_tex.jpg', 'zpos.jpg', 'zneg.jpg'];
            var matArray = [];
            _.each(fileNames, function(n) {
                var tex = THREE.ImageUtils.loadTexture(n);
                matArray.push(new THREE.MeshBasicMaterial({
                    map: tex,
                    side: THREE.BackSide
                }))
            });
            var skyboxMat = new THREE.MeshFaceMaterial( matArray );
            var box = new THREE.Mesh (new THREE.BoxGeometry(boxsize,boxsize,boxsize), skyboxMat);
            this.add(box);
        },

        setup : function() {
            var self = this;

            this.setDim(self.width, self.height);

            //this.scene.fog = new THREE.Fog(0x00000f, 50, 100);
            //this.renderer.setClearColor( self.scene.fog.color );

            this.addLight('hemi', 'hemisphere', null, {sky: 0xffffff, ground: 0xffffff, intensity: 0.3});

            this.addMaterial('phong_yellow', 'phong', {color: 0xffff00, side: THREE.DoubleSide});
            this.addMaterial('phong_green', 'phong', {color: 0x00ff00, side: THREE.DoubleSide});
            var bmap = THREE.ImageUtils.loadTexture("/marble_texture.jpg", {}, function () {
            });
            var carpet_tex = THREE.ImageUtils.loadTexture("/rug.jpg", {}, function () {
            });
            var smap = THREE.ImageUtils.loadTexture("/hide_tex.jpg", {}, function () {
            });
            bmap.wrapS = carpet_tex.wrapS = smap.wrapS = THREE.ClampToEdgeWrapping;
            bmap.wrapT = carpet_tex.wrapT = smap.wrapT = THREE.ClampToEdgeWrapping;
            bmap.minFilter = carpet_tex.minFilter = smap.minFilter = THREE.NearestFilter;

            this.addMaterial('white_marble', 'phong', {
                color: new THREE.Color("rgb(255,255,255)"),
                emissive: new THREE.Color("rgb(0,0,0)"),
                specular: new THREE.Color("rgb(64,64,64)"),
                shininess: 4,
                bumpMap: bmap,
                map: bmap,
                bumpScale: 1.0,
                side: THREE.DoubleSide
            });

            var sphere = new THREE.Mesh(
                new THREE.SphereGeometry(5, 20, 20), self.materials['white_marble']
            );
            sphere.position.set(0, 10, 0);
            //self.scene.add(sphere);

            var room = new THREE.Object3D();

            var floor = new THREE.Mesh(
                new THREE.PlaneGeometry(40, 40), self.materials['white_marble']
            )
            floor.rotation.set(PI / 2, 0, 0);
            self.scene.add(floor);

            var carpet = floor.clone();
            carpet.material = new THREE.MeshPhongMaterial({
                color: new THREE.Color("rgb(255,255,255)"),
                specular: new THREE.Color("rgb(60,10,10)"),
                shininess: 4,
                bumpMap: carpet_tex,
                map: carpet_tex,
                side: THREE.DoubleSide,
                bumpScale: 0.5
            });
            carpet.scale.set(0.9, 0.5, -0.5);
            carpet.position.y = 0.1;
            this.scene.add(carpet);

            var wall1 = new THREE.Mesh(
                new THREE.PlaneGeometry(40, 15), self.materials['white_marble']
            );
            wall1.position.set(self.wallTranslate[0][0], self.wallTranslate[0][1], self.wallTranslate[0][2]);
            wall1.rotation.set(self.wallRotation[0][0], self.wallRotation[0][1], self.wallRotation[0][2]);
            self.scene.add(wall1);

            var wall2 = new THREE.Mesh(
                new THREE.PlaneGeometry(40, 15), self.materials['white_marble']
            );
            wall2.position.set(self.wallTranslate[1][0], self.wallTranslate[1][1], self.wallTranslate[1][2]);
            wall2.rotation.set(self.wallRotation[1][0], self.wallRotation[1][1], self.wallRotation[1][2]);
            self.scene.add(wall2);

            var wall3 = new THREE.Mesh(
                new THREE.PlaneGeometry(40, 15), self.materials['white_marble']
            );
            wall3.position.set(self.wallTranslate[2][0], self.wallTranslate[2][1], self.wallTranslate[2][2]);
            wall3.rotation.set(self.wallRotation[2][0], self.wallRotation[2][1], self.wallRotation[2][2]);
            self.scene.add(wall3);

            var wall4 = new THREE.Mesh(
                new THREE.PlaneGeometry(40, 15), self.materials['white_marble']
            );
            wall4.position.set(self.wallTranslate[3][0], self.wallTranslate[3][1], self.wallTranslate[3][2]);
            wall4.rotation.set(self.wallRotation[3][0], self.wallRotation[3][1], self.wallRotation[3][2]);
            self.scene.add(wall4);

            var redlight = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 10), new THREE.MeshPhongMaterial({
                color: 0xff0000,
                emissive: 0xffd0d0
            }));
            var bluelight = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 10), new THREE.MeshPhongMaterial({
                color: 0x0000ff,
                emissive: 0xd0d0ff
            }));


            this.walllight = [];
            this.walllight.push(new THREE.PointLight(0xff00000, 2.0, 15));
            this.walllight[0].position.set(self.wallTranslate[0][0] - 2, 12, self.wallTranslate[1][2] - 2);
            this.walllight[0].add(redlight.clone());
            this.walllight.push(new THREE.PointLight(0x0000ff, 2.0, 15));
            this.walllight[1].position.set(self.wallTranslate[0][0] - 2, 12, self.wallTranslate[3][2] + 2);
            this.walllight[1].add(bluelight.clone());
            this.walllight.push(new THREE.PointLight(0x0000ff, 2.0, 15));
            this.walllight[2].position.set(self.wallTranslate[2][0] + 2, 12, self.wallTranslate[1][2] - 2);
            this.walllight[2].add(bluelight.clone());
            this.walllight.push(new THREE.PointLight(0xff0000, 2.0, 15));
            this.walllight[3].position.set(self.wallTranslate[2][0] + 2, 12, self.wallTranslate[3][2] + 2);
            this.walllight[3].add(redlight.clone());
            _.each(self.walllight, function (light) {
                self.scene.add(light)
            });

            var spotlight = new THREE.SpotLight(0xffffff);
            spotlight.position.set(0, 20, 0);
            this.scene.add(spotlight);

            //this.addLight('wall0light', 'point', {model:wall0light},{color: 0xffffff, intensity: 2});
            //this.addLight('wall2light', 'point', {model:wall2light},{color: 0xffffff, intensity: 2});
            /*
             this.addLight('direc1', 'directional', null, {color: 0xffffff, intensity: 0.8});
             this.lights['direc1'].position.set(2, 1, -1);
             this.lights['direc1'].intensity = 0.5;
             this.lights['direc1'].castShadow = true;
             */

            this.buildSkybox(1000);

            // set camera
            this.addCamera({
                fov: 75,
                aspect: self.width / self.height,
                near: 0.1,
                far: 1000.0
            }, true);
            this.moveCamera(0, [5, 15, 5], [0, 10, -5]);
        }
    };

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
