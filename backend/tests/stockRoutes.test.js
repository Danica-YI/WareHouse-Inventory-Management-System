const chai = require('chai');
const sinon = require('sinon');
const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Stock = require('../models/Stock');
const { expect } = chai;

describe('Stock route permissions', () => {
    let app;
    const id = new mongoose.Types.ObjectId().toString();
    const tokenFor = (role) => {
        const user = { _id: new mongoose.Types.ObjectId(), role };
        sinon.stub(User, 'findById').returns({ select: () => Promise.resolve(user) });
        return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    };

    before(() => {
        process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
        app = express();
        app.use(express.json());
        app.use('/api/stocks', require('../routes/stockRoutes'));
    });
    afterEach(() => sinon.restore());

    it('rejects a staff user creating a product with 403', async () => {
        const create = sinon.stub(Stock, 'create').resolves({});
        const res = await request(app).post('/api/stocks').set('Authorization', `Bearer ${tokenFor('staff')}`).send({ name: 'X' });
        expect(res.status).to.equal(403);
        expect(create.called).to.be.false;
    });

    it('rejects a staff user editing a product with 403', async () => {
        const res = await request(app).put(`/api/stocks/${id}`).set('Authorization', `Bearer ${tokenFor('staff')}`).send({ quantity: 0 });
        expect(res.status).to.equal(403);
    });

    it('rejects a staff user deleting a product with 403', async () => {
        const res = await request(app).delete(`/api/stocks/${id}`).set('Authorization', `Bearer ${tokenFor('staff')}`);
        expect(res.status).to.equal(403);
    });

    it('lets an admin create a product', async () => {
        sinon.stub(Stock, 'create').resolves({ name: 'X' });
        const res = await request(app).post('/api/stocks').set('Authorization', `Bearer ${tokenFor('admin')}`).send({ name: 'X' });
        expect(res.status).to.equal(201);
    });

    it('still lets staff list products', async () => {
        sinon.stub(Stock, 'find').resolves([]);
        const res = await request(app).get('/api/stocks').set('Authorization', `Bearer ${tokenFor('staff')}`);
        expect(res.status).to.equal(200);
    });
});
