// Firebase Service für Messeplaner
class FirestoreService {
  constructor() {
    this.db = firebase.firestore();
    this.storage = firebase.storage();
    this.collectionName = 'messen';
    this.storagePath = 'logos';
  }

  // ============ MESSEN VERWALTUNG ============

  // Alle Messen laden
  async getAllMessen() {
    try {
      const snapshot = await this.db.collection(this.collectionName)
        .orderBy('created_at', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Fehler beim Laden der Messen:', error);
      throw error;
    }
  }

  // Neue Messe erstellen
  async createMesse(messeData) {
    try {
      // ID generieren (entweder automatisch oder mit vordefinierter ID)
      const docRef = this.db.collection(this.collectionName).doc();
      
      // Metadaten hinzufügen
      const dataWithMeta = {
        ...messeData,
        id: docRef.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await docRef.set(dataWithMeta);
      
      return {
        id: docRef.id,
        ...dataWithMeta
      };
    } catch (error) {
      console.error('Fehler beim Erstellen der Messe:', error);
      throw error;
    }
  }

  // Messe aktualisieren
  async updateMesse(id, messeData) {
    try {
      const docRef = this.db.collection(this.collectionName).doc(id);
      
      const updateData = {
        ...messeData,
        updated_at: new Date().toISOString()
      };

      await docRef.update(updateData);
      
      return {
        id,
        ...updateData
      };
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Messe:', error);
      throw error;
    }
  }

  // Messe löschen
  async deleteMesse(id) {
    try {
      await this.db.collection(this.collectionName).doc(id).delete();
      return true;
    } catch (error) {
      console.error('Fehler beim Löschen der Messe:', error);
      throw error;
    }
  }

  // Messe nach ID laden
  async getMesseById(id) {
    try {
      const doc = await this.db.collection(this.collectionName).doc(id).get();
      
      if (doc.exists) {
        return {
          id: doc.id,
          ...doc.data()
        };
      }
      return null;
    } catch (error) {
      console.error('Fehler beim Laden der Messe:', error);
      throw error;
    }
  }

  // ============ LOGO VERWALTUNG ============

  // Logo hochladen
  async uploadLogo(file, fileName = 'company_logo.jpg') {
    try {
      // Datei in Blob konvertieren
      const blob = await this.fileToBlob(file);
      
      // Storage-Referenz erstellen
      const storageRef = this.storage.ref();
      const logoRef = storageRef.child(`${this.storagePath}/${fileName}`);
      
      // Datei hochladen
      const snapshot = await logoRef.put(blob);
      
      // Download-URL erhalten
      const downloadURL = await snapshot.ref.getDownloadURL();
      
      return {
        url: downloadURL,
        path: snapshot.ref.fullPath,
        size: file.size,
        name: file.name
      };
    } catch (error) {
      console.error('Fehler beim Hochladen des Logos:', error);
      throw error;
    }
  }

  // Logo laden
  async getLogo(fileName = 'company_logo.jpg') {
    try {
      const storageRef = this.storage.ref();
      const logoRef = storageRef.child(`${this.storagePath}/${fileName}`);
      
      // Prüfen ob Logo existiert
      const url = await logoRef.getDownloadURL();
      return url;
    } catch (error) {
      // Logo existiert nicht
      return null;
    }
  }

  // Logo löschen
  async deleteLogo(fileName = 'company_logo.jpg') {
    try {
      const storageRef = this.storage.ref();
      const logoRef = storageRef.child(`${this.storagePath}/${fileName}`);
      
      await logoRef.delete();
      return true;
    } catch (error) {
      console.error('Fehler beim Löschen des Logos:', error);
      throw error;
    }
  }

  // Hilfsfunktion: File zu Blob konvertieren
  fileToBlob(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(new Blob([reader.result], { type: file.type }));
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  // ============ ABONNEMENT FUNKTIONEN ============

  // Echtzeit-Listener für Messen
  subscribeToMessen(callback) {
    return this.db.collection(this.collectionName)
      .orderBy('created_at', 'desc')
      .onSnapshot(snapshot => {
        const messen = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(messen);
      }, error => {
        console.error('Fehler im Echtzeit-Listener:', error);
      });
  }

  // Listener beenden
  unsubscribeFromMessen(unsubscribe) {
    if (unsubscribe) {
      unsubscribe();
    }
  }
}

// Global verfügbar machen
window.FirestoreService = FirestoreService;