var assert = require('assert');
var conda = require('./conda');

function assertSuccess(result) {
    assert.ok((typeof result.success !== "undefined") && result.success);
}

function assertError(result) {
    assert.ok(typeof result.error !== "undefined");
}

function assertType(type) {
    return function(result) {
        assert.equal(typeof result, type);
    };
}

function assertInstance(klass) {
    return function(result) {
        assert.ok(result instanceof klass);
    };
}

function assertKey(key) {
    return function(result) {
        assert.ok(typeof result[key] !== "undefined");
    };
}

assertError = assertKey("error");

function assertAll(asserts) {
    return function(result) {
        asserts.forEach(function(assert) {
            assert(result);
        });
    };
}

describe('info', function() {
    it('should return a dictionary', function(done) {
        conda.info().then(assertType('object')).then(done);
    });

    it('should contain various keys', function(done) {
        conda.info().then().then(assertAll([
            assertKey('channels'),
            assertKey('conda_version'),
            assertKey('default_prefix'),
            assertKey('envs'),
            assertKey('envs_dirs'),
            assertKey('is_foreign'),
            assertKey('pkgs_dirs'),
            assertKey('platform'),
            assertKey('python_version'),
            assertKey('rc_path'),
            assertKey('root_prefix'),
            assertKey('root_writable'),
        ])).done(done);
    });
});

describe('search', function() {
    it('should return a dictionary', function(done) {
        conda.search().then(assertType('object')).then(done);
    });
});

describe('launch', function() {
    it('should return a dictionary', function(done) {
        conda.launch('nonexistent').then(assertType('object')).then(done);
    });

    it('should error for a nonexistent app', function(done) {
        conda.launch('nonexistent').then(assertError).then(done);
    });

    it('should error for a package that is not an app', function(done) {
        conda.launch('python').then(assertError).then(done);
    });
});

describe('Config', function() {
    var config = new conda.Config();
    it("shouldn't accept both config and file", function(done) {
        assert.throws(function() {
            new conda.Config({ system: true, file: 'test' });
        });
        done();
    });

    describe("#get", function() {
        it("should only accept certain keys", function(done) {
            assert.throws(function() {
                config.get('nonexistent_key').then(done);
            });
            done();
        });

        it("should return a dictionary", function(done) {
            config.get('channels').then(assertType('object')).done(done);
        });
    });

    describe("#getAll", function() {
        it("should return a dictionary", function(done) {
            config.get('channels').then(assertType('object')).done(done);
        });
    });

    describe("#set", function() {
        it("should only accept certain keys", function(done) {
            assert.throws(function() {
                config.set('nonexistent_key', 'value').then(done);
            });
            done();
        });

        it("should succeed", function(done) {
            config.set('use_pip', true).then(assertSuccess).then(function() {
                config.set('use_pip', false).then(assertSuccess).done(done);
            });
        });
    });
});

describe('Env', function() {
    var envs;
    before(function(done) {
        conda.Env.getEnvs().then(function(result) {
            envs = result;
            done();
        });
    });

    // TODO this and removeEnv below are extremely slow, time out
    // describe('.create', function() {
    //     it('should return a dictionary', function(done) {
    //         conda.Env.create({ name: 'testing', packages: ['_license'] })
    //             .then(assertType('object')).then(done);
    //     });
    // });

    describe('.getEnvs', function() {
        it('should return a list of Envs', function() {
            assertInstance(conda.Env)(envs[0]);
        });
    });

    describe('#install', function() {
        it('should return a dictionary', function(done) {
            envs[0].install({ packages: ['python'] })
                .then(assertSuccess).done(done);
        });
    });

    describe('#linked', function() {
        it('should return a list of Packages', function(done) {
            envs[0].linked().then(function(result) {
                assert.ok(Array.isArray(result));
                assertInstance(conda.Package)(result[0]);
            }).done(done);
        });

        it('should return a list of strings with simple=true', function(done) {
            envs[0].linked({ simple: true }).then(function(result) {
                assert.ok(Array.isArray(result));
                assertType('string')(result[0]);
            }).done(done);
        });
    });

    describe('#revisions', function() {
        it('should return a list of objects', function(done) {
            envs[0].revisions().then(function(result) {
                assert.ok(Array.isArray(result));
                assertType('object')(result[0]);
            }).done(done);
        });
    });

    // describe('#removeEnv', function() {
    //     it('should return a dictionary', function(done) {
    //         envs.forEach(function(env) {
    //             if (env.name === 'testing') {
    //                 env.removeEnv().then(assertType('object')).done(done);
    //             }
    //         });
    //     });
    // });
});
