import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDoc, getDocs, deleteDoc, doc, updateDoc, deleteField, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-firestore.js";


export default class ServiceFirestore {
    static INIT_DEFAULT_COLLECTION = "default-collection";

    constructor(config, collection = ServiceFirestore.INIT_DEFAULT_COLLECTION) {
        this.config = config;
        this.app = initializeApp(config);
        this.db = getFirestore(this.app);
        this.defaultCollection = collection;
    }

    async createDocument(jsonFile, selectedCollection = this.defaultCollection) {
        try {
            const docRef = await addDoc(collection(this.db, selectedCollection), jsonFile);
            console.log("Document written with ID: ", docRef.id);
            return docRef.id;
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    async getAllDocuments(selectedCollection = this.defaultCollection) {
        const querySnapshot = await getDocs(collection(this.db, selectedCollection));

        let docsArray = []

        querySnapshot.forEach(element => {
            docsArray.push(element.data())
        });
        
        return docsArray;
    }

    async getDocumentById(docId, selectedCollection = this.defaultCollection) {
        const docRef = doc(this.db, selectedCollection, docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
            return docSnap.data();
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }


    // https://firebase.google.com/docs/firestore/query-data/queries
    async query(docProp, comparisonOperator, value, selectedCollection = this.defaultCollection) {
        let results = [];
        const q = query(collection(this.db, selectedCollection), where(docProp, comparisonOperator, value));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
            results.push(doc.data());
        });

        return results;
    }


    async updateDocument(fieldsToUpdate, docId, selectedCollection = this.defaultCollection) {
        const docRef = doc(this.db, selectedCollection, docId);

        if (typeof fieldsToUpdate === "object") {
            await updateDoc(docRef, fieldsToUpdate);
            return;
        }

        console.error("Incorrect object format")

        console.log(typeof fieldsToDelete);
        
    }

    async deleteFields(fieldsToDelete, docId, selectedCollection = this.defaultCollection) {
        // Check for correct data type
        if (typeof fieldsToDelete !== "string" && typeof fieldsToDelete !== "object") {
            console.error("Incorrect data type: " + typeof fieldsToDelete);
            return;
        }

        const deletedFieldsObject = new Object();
        if (typeof fieldsToDelete === "string") {
            deletedFieldsObject[fieldsToDelete] = deleteField();
        }
        else {
            fieldsToDelete.forEach(element => {
                deletedFieldsObject[element] = deleteField();
            });
        }

        this.updateDocument(deletedFieldsObject, docId, selectedCollection);
    }

    async deleteDocument(docId, selectedCollection = this.defaultCollection) {
        await deleteDoc(doc(this.db, selectedCollection, docId));
    }

    listenToDocument(docId, selectedCollection = this.defaultCollection) {
        const unsubscribe = onSnapshot(doc(this.db, selectedCollection, docId), (doc) => {
            console.log("Current data: ", doc.data());
        });
        return unsubscribe;
    }



};


