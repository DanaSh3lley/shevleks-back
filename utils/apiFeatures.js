class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter(...fields) {
        const queryObj = {...this.queryString};
        const excludedFields = ['page', 'sort', 'limit', 'fields', ...fields];
        excludedFields.forEach(el => delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    filterVolume() {
        if (this.queryString.volume) {
            const volume = this.queryString.volume.split(',').map((volume) => volume.trim());
            this.query = this.query.where('price.volume').in(volume);
        }
        return this;
    }

    filterPrice() {
        if (this.queryString.price) {
            const price = this.queryString.price.split(',').map((price) => price.trim());
            this.query = this.query.where('price.value').gte(price[0]).lte(price[1]);
        }
        return this;
    }

    filterCategory() {
        if (this.queryString.category) {
            const category = this.queryString.category
                .split(',')
                .map((category) => category);

            this.query = this.query.where('category').in(category);
        }
        return this;
    }

    search() {
        const {search} = this.queryString;
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            this.query = this.query.where({
                $or: [
                    {'name.en': {$regex: searchRegex}},
                    {'name.uk': {$regex: searchRegex}},
                ],
            });
        }
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;
