import { fileURLToPath } from "url";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import os from 'os'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../database.json");
const csvPath = path.join(__dirname, "../database.csv");

const readContacts = () => {
  if (!fs.existsSync) return [];
  const data = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(data || "[]");
};

const writeContacts = (contact) => {
  fs.writeFileSync(dbPath, JSON.stringify(contact, null, 2));
  syncCSV(contact);
};
const syncCSV = (contact) => {
  const csv = ["id,title,author"]
    .concat(
      contact.map(
        (contact) => `${contact.id},${contact.name},${contact.number}`
      )
    )
    .join("\n");
  fs.writeFileSync(csvPath, csv);
};

const contactController = {
  createContact: (req, res) => {
    const { name, number } = req.body;
    if (!name || !number) {
      res.status(400).json({ msg: "Invalid data" });
      return;
    }
    let contacts = readContacts();
    let uuid = crypto.randomUUID();

    const newContact = { id: uuid, name, number };
    contacts.push(newContact);
    writeContacts(contacts);
    fs.appendFileSync(
      csvPath,
      `\n${newContact.id},${newContact.name},${newContact.number}`
    );
    res.status(201).json({
      msg: "Contact created with success",
      contacts: contacts,
    });
  },
  getAllContacts: (req, res) => {
    const contacts = readContacts();
    syncCSV(contacts);
    res.status(200).json({
      msg: "These are all the Contacts",
      contacts: contacts,
    });
  },
  getContactById: (req, res) => {
    const { id } = req.params;
    const contacts = readContacts();
    const contact = contacts.find((b) => b.id == id);
    if (!contact) {
      res.status(404).json({ msg: "contact does not exists" });
      return;
    }
    res.status(200).json({ msg: "contact found", contact: contact });
  },
  updateContact: (req, res) => {
    const { id } = req.params;
    const { name, number } = req.body;
    if (!name || !number) {
    res.status(400).json({ msg: "Invalid data" });
      return;
    }
    const contacts = readContacts();
    const index = contacts.findIndex((c) => c.id == id);
    if (index === -1) return res.status(404).json({ msg: "contact not found" });

    contacts[index] = { ...contacts[index], name, number };
    writeContacts(contacts);
    res.json(contacts[index]);
  },
  deleteContact: (req, res) => {
        const {id} = req.params;
        const contacts = readContacts();
        const index = contacts.findIndex(c => c.id == id);
        if (index === -1) return res.status(404).json({ msg: 'contct not found' });

        contacts.splice(id,1)[0]; // ici j'extrait et renvoie l'objet spécifique de la position id du tableau 
        writeContacts(contacts);
        res.status(200).json({msg:"Contact Deleted with succes",contacts:contacts});
  },
  getStatus: (req, res) => {
    const constact = readContacts();
    res.status(200).json({
      contactsNumber: constact.length,
      SystemInfo: os
    })
  },
};

export default contactController;
