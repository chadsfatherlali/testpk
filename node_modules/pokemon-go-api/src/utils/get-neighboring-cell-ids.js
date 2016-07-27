// external dependencies
const s2geometry = require('s2geometry-node');

exports = module.exports = function(latitude, longitude) {
  const s2Location = new s2geometry.S2LatLng(latitude, longitude);
  const s2CellId = new s2geometry.S2CellId(s2Location);
  var origin = s2CellId.parent(15);
  var next = origin.next();
  var prev = origin.prev();
  var cellIds = [
    origin.id()
  ];
  var i = 0;

  for (i; i < 10; i++) {
      // in range(10):
      cellIds.push(prev.id());
      cellIds.push(next.id());
      next = next.next();
      prev = prev.prev();
  }

  return cellIds.sort(function(a, b) {
    return a > b;
  });
};
