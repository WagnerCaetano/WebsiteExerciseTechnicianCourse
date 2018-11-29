/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package tabelas;

/**
 *
 * @author u18300
 */
public class Categoria {
    private String NomeC;
    private String Descricao;
    
    public boolean isUsed()
    {
        return (NomeC.length()>0 && Descricao.length()>0);
    }
    
    public Categoria(String Nome,String Descricao){ setNomeC(Nome); setDescricao(Descricao);}
    
    public void setDescricao(String Descricao){this.Descricao = Descricao;}
    public String getDescricao(){return this.Descricao;}
    public void setNomeC(String Nome){this.NomeC = Nome;}
    public String getNomeC(){return this.NomeC;}
}
