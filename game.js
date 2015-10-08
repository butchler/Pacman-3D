window.game = function () {
    var PACMAN_SPEED = 2, PACMAN_RADIUS = 0.25;
    var GHOST_RADIUS = PACMAN_RADIUS * 1.25;
    var DOT_RADIUS = 0.05, PELLET_RADIUS = DOT_RADIUS * 2;
    var UP = new THREE.Vector3(0, 0, 1);
    var LEFT = new THREE.Vector3(-1, 0, 0);
    var TOP = new THREE.Vector3(0, 1, 0);
    var RIGHT = new THREE.Vector3(1, 0, 0);
    var BOTTOM = new THREE.Vector3(0, -1, 0);
    var LEVEL = [
        '# # # # # # # # # # # # # # # # # # # # # # # # # # # #',
        '# . . . . . . . . . . . . # # . . . . . . . . . . . . #',
        '# . # # # # . # # # # # . # # . # # # # # . # # # # . #',
        '# o # # # # . # # # # # . # # . # # # # # . # # # # o #',
        '# . # # # # . # # # # # . # # . # # # # # . # # # # . #',
        '# . . . . . . . . . . . . . . . . . . . . . . . . . . #',
        '# . # # # # . # # . # # # # # # # # . # # . # # # # . #',
        '# . # # # # . # # . # # # # # # # # . # # . # # # # . #',
        '# . . . . . . # # . . . . # # . . . . # # . . . . . . #',
        '# # # # # # . # # # # #   # #   # # # # # . # # # # # #',
        '          # . # # # # #   # #   # # # # # . #          ',
        '          # . # #         G           # # . #          ',
        '          # . # #   # # # # # # # #   # # . #          ',
        '# # # # # # . # #   #             #   # # . # # # # # #',
        '            .       #             #       .            ',
        '# # # # # # . # #   #             #   # # . # # # # # #',
        '          # . # #   # # # # # # # #   # # . #          ',
        '          # . # #                     # # . #          ',
        '          # . # #   # # # # # # # #   # # . #          ',
        '# # # # # # . # #   # # # # # # # #   # # . # # # # # #',
        '# . . . . . . . . . . . G # # . . . . . . . . . . . . #',
        '# . # # # # . # # # # # . # # . # # # # # . # # # # . #',
        '# . # # # # . # # # # # . # # . # # # # # . # # # # . #',
        '# o . . # # . . . . . o . P   . . . . . . . # # . . o #',
        '# # # . # # . # # . # # # # # # # # . # # . # # . # # #',
        '# # # . # # . # # . # # # # # # # # . # # . # # . # # #',
        '# . . . . . . # # . . . . # # . . . . # # . . . . . . #',
        '# . # # # # # # # # # # . # # . # # # # # # # # # # . #',
        '# . # # # # # # # # # # . # # . # # # # # # # # # # . #',
        '# . . . . . . . . . . . . . . . . . . . . . . . . . . #',
        '# # # # # # # # # # # # # # # # # # # # # # # # # # # #'
            ];

    var initLevel = function (levelDefinition, scene) {
        var map = {};
        map.bottom = -(levelDefinition.length - 1);
        map.top = 0;
        map.left = 0;
        map.right = 0;
        map.numDots = 0;
        map.pacmanSpawn = null;
        map.ghostSpawn = null;

        var x, y;
        for (var row = 0; row < levelDefinition.length; row++) {
            // Set the coordinates of the map so that they match the
            // coordinate system for objects.
            y = -row;

            map[y] = {};

            // Get the length of the longest row in the level definition.
            var length = Math.floor(levelDefinition[row].length / 2);
            //map.right = Math.max(map.right, length - 1);
            map.right = Math.max(map.right, length);

            // Skip every second element, which is just a space for readability.
            for (var column = 0; column < levelDefinition[row].length; column += 2) {
                x = Math.floor(column / 2);

                var cell = levelDefinition[row][column];
                var object = null;

                if (cell === '#') {
                    object = createWall();
                } else if (cell === '.') {
                    object = createDot();
                    map.numDots += 1;
                } else if (cell === 'o') {
                    object = createPowerPellet();
                } else if (cell === 'P') {
                    map.pacmanSpawn = new THREE.Vector3(x, y, 0);
                } else if (cell === 'G') {
                    map.ghostSpawn = new THREE.Vector3(x, y, 0);
                }

                if (object !== null) {
                    object.position.set(x, y, 0);
                    map[y][x] = object;
                    scene.add(object);
                }
            }
        }

        return map;
    };

    var createWall = function () {
        var wallGeometry = new THREE.BoxGeometry(1, 1, 1);
        var wallMaterial = new THREE.MeshLambertMaterial({ color: 'blue' });

        return function () {
            var wall = new THREE.Mesh(wallGeometry, wallMaterial);
            wall.isWall = true;

            return wall;
        };
    }();

    var createDot = function () {
        var dotGeometry = new THREE.SphereGeometry(DOT_RADIUS);
        var dotMaterial = new THREE.MeshPhongMaterial({ color: 0xFFDAB9 }); // Paech color

        return function () {
            var dot = new THREE.Mesh(dotGeometry, dotMaterial);
            dot.isDot = true;

            return dot;
        };
    }();

    var createPowerPellet = function() {
        var pelletGeometry = new THREE.SphereGeometry(PELLET_RADIUS, 12, 8);
        var pelletMaterial = new THREE.MeshPhongMaterial({ color: 0xFFDAB9 }); // Paech color

        return function () {
            var pellet = new THREE.Mesh(pelletGeometry, pelletMaterial);
            pellet.isPowerPellet = true;

            return pellet;
        };
    }();

    var initRenderer = function () {
        var renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setClearColor('black', 1.0);
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        return renderer;
    }

    var initScene = function () {
        var scene = new THREE.Scene();

        // Create lighting
        scene.add(new THREE.AmbientLight(0x888888));
        var light = new THREE.SpotLight('white', 0.5);
        light.position.set(10, 10, 50);
        scene.add(light);

        return scene;
    };

    var initHudCamera = function (map) {
        var halfWidth = (map.right - map.left) / 2, halfHeight = (map.top - map.bottom) / 2;
        var centerX = (map.left + map.right) / 2, centerY = (map.bottom + map.top) / 2;

        var hudCamera = new THREE.OrthographicCamera(-halfWidth, halfWidth, halfHeight, -halfHeight, 1, 100);
        hudCamera.position.copy(new THREE.Vector3(centerX, centerY, 10));
        hudCamera.lookAt(new THREE.Vector3(centerX, centerY, 0));

        return hudCamera;
    };

    var renderHud = function (renderer, hudCamera, scene) {
        // Increase size of pacman and dots in HUD to make them easier to see.
        scene.children.forEach(function (object) {
            if (object.isWall !== true)
                object.scale.set(2.5, 2.5, 2.5);
        });

        // Only render in the bottom left 200x200 square of the screen.
        renderer.enableScissorTest(true);
        renderer.setScissor(10, 10, 200, 200);
        renderer.setViewport(10, 10, 200, 200);
        renderer.render(scene, hudCamera);
        renderer.enableScissorTest(false);

        // Reset scales after rendering HUD.
        scene.children.forEach(function (object) {
            object.scale.set(1, 1, 1);
        });
    };

    var createPacman = function () {
        //var pacmanGeometry = new THREE.SphereGeometry(PACMAN_RADIUS, 16, 16);

        // Create spheres with decreasingly small horizontal sweeps, in order
        // to create pacman "death" animation.
        var pacmanGeometries = [];
        var numFrames = 40;
        var offset;
        for (var i = 0; i < numFrames; i++) {
            offset = (i / (numFrames - 1)) * Math.PI;
            pacmanGeometries.push(new THREE.SphereGeometry(PACMAN_RADIUS, 16, 16, offset, Math.PI * 2 - offset * 2));
            pacmanGeometries[i].rotateX(Math.PI / 2);
        }

        var pacmanMaterial = new THREE.MeshPhongMaterial({ color: 'yellow', side: THREE.DoubleSide });

        return function (position, scene) {
            //var pacman = new THREE.Mesh(pacmanGeometry, pacmanMaterial);

            var pacman = new THREE.Mesh(pacmanGeometries[0], pacmanMaterial);
            pacman.frames = pacmanGeometries;
            pacman.currentFrame = 0;

            pacman.isPacman = true;
            pacman.isWrapper = true;
            pacman.atePellet = false;

            // Initialize facing left.
            pacman.position.copy(position);
            pacman.direction = new THREE.Vector3(-1, 0, 0);

            scene.add(pacman);

            return pacman;
        };
    }();

    var _lookAt = new THREE.Vector3();
    var movePacman = function (pacman, scene, map, keys, delta, now) {
        // Update rotation based on direction so that mouth is always facing forward.
        // The "mouth" part is on the side of the sphere, make it "look" up but
        // set the up direction so that it points forward.
        pacman.up.copy(_lookAt.copy(pacman.direction).applyAxisAngle(UP, -Math.PI / 2));
        pacman.lookAt(_lookAt.copy(pacman.position).add(UP));

        // Move based on current keys being pressed.
        if (keys[87]) {
            // W - move forward
            //pacman.translateOnAxis(pacman.direction, PACMAN_SPEED * delta);
            pacman.translateOnAxis(LEFT, PACMAN_SPEED * delta);
        }
        if (keys[65]) {
            // A - rotate left
            pacman.direction.applyAxisAngle(UP, Math.PI / 2 * delta);
        }
        if (keys[68]) {
            // D - rotate right
            pacman.direction.applyAxisAngle(UP, -Math.PI / 2 * delta);
        }
        if (keys[83]) {
            // S - move backward
            //pacman.translateOnAxis(pacman.direction, -PACMAN_SPEED * delta);
            pacman.translateOnAxis(LEFT, -PACMAN_SPEED * delta);
        }

        // Check for collision with walls.
        var leftSide = pacman.position.clone().addScaledVector(LEFT, PACMAN_RADIUS).round();
        var topSide = pacman.position.clone().addScaledVector(TOP, PACMAN_RADIUS).round();
        var rightSide = pacman.position.clone().addScaledVector(RIGHT, PACMAN_RADIUS).round();
        var bottomSide = pacman.position.clone().addScaledVector(BOTTOM, PACMAN_RADIUS).round();
        if (isWall(map, leftSide)) {
            pacman.position.x = leftSide.x + 0.5 + PACMAN_RADIUS;
        }
        if (isWall(map, rightSide)) {
            pacman.position.x = rightSide.x - 0.5 - PACMAN_RADIUS;
        }
        if (isWall(map, topSide)) {
            pacman.position.y = topSide.y - 0.5 - PACMAN_RADIUS;
        }
        if (isWall(map, bottomSide)) {
            pacman.position.y = bottomSide.y + 0.5 + PACMAN_RADIUS;
        }

        var cell = getAt(map, pacman.position);

        // Make pacman eat dots.
        if (cell && cell.isDot === true) {
            removeAt(map, scene, pacman.position);
            map.numDots -= 1;
        }

        // Make pacman eat power pellets.
        pacman.atePellet = false;
        if (cell && cell.isPowerPellet === true) {
            removeAt(map, scene, pacman.position);
            pacman.atePellet = true;
        }
    };

    // Make object wrap to other side of map if it goes out of bounds.
    var wrapObject = function (object, map) {
        if (object.position.x < map.left)
            object.position.x = map.right;
        else if (object.position.x > map.right)
            object.position.x = map.left;

        if (object.position.y > map.top)
            object.position.y = map.bottom;
        else if (object.position.y < map.bottom)
            object.position.y = map.top;
    };

    var removeAt = function (map, scene, position) {
        var x = Math.round(position.x), y = Math.round(position.y);
        if (map[y] && map[y][x]) {
            scene.remove(map[y][x]);
            delete map[y][x];
        }
    }

    var getAt = function (map, position) {
        var x = Math.round(position.x), y = Math.round(position.y);
        return map[y] && map[y][x];
    }

    var isWall = function (map, position) {
        var cell = getAt(map, position);
        return cell && cell.isWall === true;
    };

    var moveCamera = function (pacman, camera, won, lost, delta) {
        if (lost) {
            // Slowly move camera above pacman, looking down.
            camera.position.lerp(camera.targetPosition, delta);
            camera.lookAtPosition.lerp(camera.targetLookAt, delta);
            camera.lookAt(camera.lookAtPosition);
        } else {
            // Place camera above and behind pacman, looking towards direction of pacman.
            camera.position.copy(pacman.position).addScaledVector(UP, 1.5).addScaledVector(pacman.direction, -1);
            camera.up.copy(UP);
            camera.lookAtPosition = pacman.position.clone().add(pacman.direction);
            camera.lookAt(camera.lookAtPosition);
        }
    };

    var animationLoop = function (callback, requestFrameFunction) {
        requestFrameFunction = requestFrameFunction || requestAnimationFrame;

        var previousFrameTime = window.performance.now();

        // How many seconds the animation has progressed in total.
        var animationSeconds = 0;

        var render = function () {
            var now = window.performance.now();
            var animationDelta = (now - previousFrameTime) / 1000;
            previousFrameTime = now;

            // requestAnimationFrame will not call the callback if the browser
            // isn't visible, so if the browser has lost focus for a while the
            // time since the last frame might be very large. This could cause
            // strange behavior (such as objects teleporting through walls in
            // one frame when they would normally move slowly toward the wall
            // over several frames), so make sure that the delta is never too
            // large.
            animationDelta = Math.min(animationDelta, 1/30);

            // Keep track of how many seconds of animation has passed.
            animationSeconds += animationDelta;

            callback(animationDelta, animationSeconds);

            requestFrameFunction(render);
        };

        requestFrameFunction(render);
    };

    var createGhost = function () {
        var ghostGeometry = new THREE.SphereGeometry(GHOST_RADIUS, 16, 16);

        return function (scene, position) {
            // Give each ghost it's own material so we can change the colors of individual ghosts.
            var ghostMaterial = new THREE.MeshPhongMaterial({ color: 'red' });
            var ghost = new THREE.Mesh(ghostGeometry, ghostMaterial);
            ghost.isGhost = true;
            ghost.isWrapper = true;
            ghost.isAfraid = false;

            // Ghosts start moving left.
            ghost.position.copy(position);
            ghost.direction = new THREE.Vector3(-1, 0, 0);

            scene.add(ghost);
        };
    }();

    var moveGhost = function () {
        var previousPosition = new THREE.Vector3();
        var currentPosition = new THREE.Vector3();
        var leftTurn = new THREE.Vector3();
        var rightTurn = new THREE.Vector3();

        return function (ghost, map, delta) {
            previousPosition.copy(ghost.position).addScaledVector(ghost.direction, 0.5).round();
            ghost.translateOnAxis(ghost.direction, delta);
            currentPosition.copy(ghost.position).addScaledVector(ghost.direction, 0.5).round();

            // If the ghost is transitioning from one cell to the next, see if they can turn.
            if (!currentPosition.equals(previousPosition)) {
                leftTurn.copy(ghost.direction).applyAxisAngle(UP, Math.PI / 2);
                rightTurn.copy(ghost.direction).applyAxisAngle(UP, -Math.PI / 2);

                var forwardWall = isWall(map, currentPosition);
                var leftWall = isWall(map, currentPosition.copy(ghost.position).add(leftTurn));
                var rightWall = isWall(map, currentPosition.copy(ghost.position).add(rightTurn));

                if (!leftWall || !rightWall) {
                    // If the ghsot can turn, randomly choose one of the possible turns.
                    var possibleTurns = [];
                    if (!forwardWall) possibleTurns.push(ghost.direction);
                    if (!leftWall) possibleTurns.push(leftTurn);
                    if (!rightWall) possibleTurns.push(rightTurn);

                    if (possibleTurns.length === 0)
                        throw new Error('A ghost got stuck!');

                    var newDirection = possibleTurns[Math.floor(Math.random() * possibleTurns.length)];
                    ghost.direction.copy(newDirection);

                    // Snap ghost to center of current cell and start moving in new direction.
                    ghost.position.round().addScaledVector(ghost.direction, delta);
                }
            }
        }
    }();

    var distance = function () {
        var difference = new THREE.Vector3();

        return function (object1, object2) {
            // Calculate difference between objects' positions.
            difference.copy(object1.position).sub(object2.position);

            return difference.length();
        };
    }();

    return {
        main: function () {
            // Keep track of current keys being pressed.
            var keys = {};
            document.addEventListener('keydown', function (event) {
                keys[event.keyCode] = true;
            });
            document.addEventListener('keyup', function (event) {
                keys[event.keyCode] = false;
            });
            document.addEventListener('blur', function (event) {
                keys = {};
            });

            var renderer = initRenderer();
            var scene = initScene();

            var map = initLevel(LEVEL, scene);

            // Create main camera
            var camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);

            // Create HUD camera
            var hudCamera = initHudCamera(map);

            var pacman = createPacman(map.pacmanSpawn, scene);

            var ghostSpawnTime = -8;
            var numGhosts = 0;

            var won = lost = false;
            var lostTime = 0;

            var lives = 3;

            var update = function (delta, now) {
                if (!won && !lost) {
                    movePacman(pacman, scene, map, keys, delta);
                } else if (lost && now - lostTime > 4) {
                    lost = false;
                    pacman.geometry = pacman.frames[0];
                    pacman.position.copy(map.pacmanSpawn);
                }

                if (lives < 0) {
                    // TODO
                }

                if (lost) {
                    var angle = (now - lostTime) * Math.PI / 2;
                    var frame = Math.min(pacman.frames.length - 1, Math.floor(angle / Math.PI * pacman.frames.length));

                    pacman.geometry = pacman.frames[frame];
                } else {
                    var maxAngle = Math.PI / 4;
                    var angle = (now * 3) % (maxAngle * 2);
                    if (angle > maxAngle)
                        angle = maxAngle * 2 - angle;
                    var frame = Math.floor(angle / Math.PI * pacman.frames.length);

                    pacman.geometry = pacman.frames[frame];
                }

                moveCamera(pacman, camera, won, lost, delta);

                var remove = [];
                scene.children.forEach(function (object) {
                    if (object.isGhost === true) {
                        var ghost = object;

                        // Make all ghosts afraid if Pacman just ate a pellet.
                        if (pacman.atePellet === true) {
                            ghost.isAfraid = true;
                            ghost.becameAfraidTime = now;

                            ghost.material.color.setStyle('white');
                        }

                        // Make ghosts not afraid anymore after 10 seconds.
                        if (ghost.isAfraid && now - ghost.becameAfraidTime > 10) {
                            ghost.isAfraid = false;

                            ghost.material.color.setStyle('red');
                        }

                        moveGhost(ghost, map, delta);

                        // Check for collision between Pacman and ghost.
                        if (!lost && !won && distance(pacman, ghost) < PACMAN_RADIUS + GHOST_RADIUS) {
                            if (ghost.isAfraid === true) {
                                remove.push(ghost);
                                numGhosts -= 1;
                            } else {
                                lives -= 1;
                                lost = true;
                                lostTime = now;
                                camera.targetPosition = pacman.position.clone().addScaledVector(UP, 4);
                                camera.targetLookAt = pacman.position.clone().addScaledVector(pacman.direction, 0.01);
                            }
                        }
                    }

                    if (object.isWrapper === true)
                        wrapObject(object, map);
                });

                // Cannot remove items from scene.children while iterating
                // through it, so remove them after the forEach loop.
                remove.forEach(scene.remove, scene);

                // Spawn a ghost every 2 seconds, up to 4 ghosts.
                if (numGhosts < 4 && now - ghostSpawnTime > 8) {
                    createGhost(scene, map.ghostSpawn);
                    numGhosts += 1;
                    ghostSpawnTime = now;
                }
            };

            animationLoop(function (delta, now) {
                update(delta, now);

                // Render main view
                renderer.setViewport(0, 0, renderer.domElement.width, renderer.domElement.height);
                renderer.render(scene, camera);

                // Render HUD
                renderHud(renderer, hudCamera, scene);
            });
        }
    };
}();
