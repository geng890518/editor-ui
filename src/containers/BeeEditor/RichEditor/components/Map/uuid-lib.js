var validator = new RegExp('^[a-z0-9]{32}$', 'i');

function gen(count) {
  var out = '';
  for (let i = 0; i < count; i++) {
    out += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return out;
}

function Uuid(uuid) {
  if (!uuid) throw new TypeError('Invalid argument; `value` has no value.');

  let value = Uuid.EMPTY;

  if (uuid && uuid instanceof Uuid) {
    value = Uuid.toString();
  } else if (uuid && Object.prototype.toString.call(uuid) === '[object String]' && Uuid.isUuid(uuid)) {
    value = uuid;
  }

  this.equals = (other) => Uuid.isUuid(other) && value === other;
    // Comparing string `value` against provided `uuid` will auto-call
    // toString on `uuid` for comparison


  this.isEmpty = () => value === Uuid.EMPTY;

  this.toString = () => value;


  this.toJSON = () => value;

  Object.defineProperty(this, 'value', {
    enumerable: true
  });
}

Object.defineProperty(Uuid, 'EMPTY', {
  value: '00000000000000000000000000000000'
});

Uuid.isUuid = (value) => value && (value instanceof Uuid || validator.test(value.toString()));

Uuid.create = () => new Uuid(gen(8));

Uuid.raw = () => gen(8);


module.exports = Uuid;
