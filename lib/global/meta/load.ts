export default function loadMeta(url: URL) {
  var that = this;
  
  Object.entries(url).map(([name, value]) => {
    that.meta[name] = value;
  });

  return true;
}