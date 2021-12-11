const { response } = require("express");
const express = require("express");
//a uuid v4 gera valores randomicos. para entender melhor as versoes, ler a doc
const { v4: uuidv4 } = require("uuid");

const app = express();

const customers = [];
app.use(express.json());

/**
 * Modelagem para criar conta
 * id - uuid
 * cpf - string
 * name - string
 * statement - []
 */

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

app.get("/account", (req, res) => {});

app.listen(3333);
