import { Product } from "src/products/entities/product.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text',{
        unique: true
    })
    email: string;

    @Column('text', {
        select: false
    })
    password: string;

    @Column('text')
    fullName: string;

    @Column('bool', {
        default: true
    })
    isActive: boolean;

    @Column('text', {
        array: true,
        default: ['user']
    })
    roles:string[];

    @OneToMany(
        () => Product,
        ( product ) => product.user
    )
    products: Product[];

    @BeforeInsert()
    @BeforeUpdate()
    checkFieldsBeforeInsert(){
        this.email = this.email.toLowerCase().trim() 
    }
}
