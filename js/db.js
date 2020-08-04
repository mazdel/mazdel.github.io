class DB{
    static dbPromised = idb.open("liga-inggris", 1, (upgradeDb)=> {
        const favorite_team = upgradeDb.createObjectStore("favorite_team", {
        keyPath: "id"
        });
        favorite_team.createIndex("name", "name", { unique: false });
    });

    static saveFavorite(favorite_team){
        this.dbPromised.then(db=>{
            const tx = db.transaction(`favorite_team`,`readwrite`);
            const store = tx.objectStore(`favorite_team`);
            store.add(favorite_team);
            return tx.complete;
        })
        .then((done)=>{
            console.log(`favorite telah tersimpan`,done);
        })
        .catch(error=>{
            console.log(`error`,error);
        })
    }
    static deleteFavorite(teamId){
        this.dbPromised.then(db=>{
            const tx = db.transaction(`favorite_team`,`readwrite`);
            const store = tx.objectStore(`favorite_team`);
            store.delete(teamId);
            return tx.complete;
        })
        .then((done)=>{
            console.log(`favorite telah terhapus`,done);
        })
        .catch(error=>{
            console.log(`error`,error);
        })
    }
    static getFavTeams(){
        return new Promise((resolve,reject)=>{
            this.dbPromised
            .then(db=>{
                const tx = db.transaction(`favorite_team`,`readonly`);
                const store = tx.objectStore(`favorite_team`);
                return store.getAll();
            })
            .then(favorite_team=>{
                resolve(favorite_team);
            })
        });
    }
    static getFavTeamById(id){
        return new Promise((resolve,reject)=>{
            this.dbPromised
            .then(db=>{
                const tx=db.transaction(`favorite_team`,`readonly`);
                const store = tx.objectStore(`favorite_team`);
                return store.get(id);
            })
            .then(favorite_team=>{
                resolve(favorite_team);
            });
        });
    }
}