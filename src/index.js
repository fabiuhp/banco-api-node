const { response } = require("express");
const express = require("express");
//a uuid v4 gera valores randomicos. para entender melhor as versoes, ler a doc
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

const customers = [];

function verifyIfExistAccountCPF(req, res, next) {
    const { cpf } = req.headers;

    const customer = customers.find((customer) => customer.cpf === cpf);

    if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
    }

    req.customer = customer;

    return next();
}

function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if (operation.type === "credit") {
            return acc + operation.amount;
        } else {
            return acc - operation.amount;
        }
    }, 0);

    return balance;
}

app.post("/account", (req, res) => {
    const { cpf, name } = req.body;
    const customerAlreadyExists = customers.some(
        (customer) => customer.cpf === cpf
    );

    if (customerAlreadyExists) {
        return res.status(400).json({ error: "Customer already exists." });
    }

    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statatement: [],
    });

    return res.status(201).send();
});

app.get("/statement", verifyIfExistAccountCPF, (req, res) => {
    const { customer } = req;
    return res.json(customer.statatement);
});

app.post("/deposit", verifyIfExistAccountCPF, (req, res) => {
    const { description, amount } = req.body;
    const { customer } = req;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit",
    };

    customer.statatement.push(statementOperation);

    return res.status(201).send();
});

app.post("/withdraw", verifyIfExistAccountCPF, (req, res) => {
    const { amount } = req.body;
    const { customer } = req;

    const balance = getBalance(customer.statatement);

    if (balance < amount) {
        return res.status(400).json({ error: "Insufficient funds" });
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: "debit",
    };

    customer.statatement.push(statementOperation);
    return res.status(201).send();
});

app.listen(3333);
