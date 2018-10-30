export default {
  getMostFrequentlyUsed() {
    const values = this.loadFrequentlyUsed();
    const objValues = Object.keys(values).map((key) => {
      return values[key];
    });
    const sortedValues = objValues.sort((a, b) => {
      return (a.searches - b.searches) * -1;
    });
    return sortedValues;
  },

  addToFrequentyUsed(type, name) {
    const values = this.loadFrequentlyUsed();
    const key = `${type}-${name}`;
    const value = values[key] || {};

    value.searches = (value.searches || 0) + 1;
    value.type = type;
    value.name = name;
    value.lastSearch = new Date();

    values[key] = value;
    this.saveFrequentlyUsed(values);
  },

  saveFrequentlyUsed(values) {
    const rawValues = JSON.stringify(values);
    localStorage.setItem('search-frequency', rawValues);
  },

  loadFrequentlyUsed() {
    const rawValues = localStorage.getItem('search-frequency') || '{}';
    const values = JSON.parse(rawValues);

    // eslint-disable-next-line guard-for-in
    for (const index in values) {
      const value = values[index];
      value.lastSearch = new Date(value.lastSearch);
      values[index] = value;
    }
    return values;
  },
};
