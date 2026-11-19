class Usuario {
 constructor({id_usuario,nome,email,senha,tipo}){
    this.id=id_usuario;
    this.nome=nome;
    this.email=email;
    this.senha=senha;
    this.tipo=tipo;
    }


 toPublicJSON(){
    return{
        id:this.id,
        nome:this.nome,
        email:this.email,
        tipo:this.tipo
        };
    }
}


module.exports=Usuario;

