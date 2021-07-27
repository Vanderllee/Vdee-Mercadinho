import { Router, Response, Request } from 'express';

/*import { readFile } from 'fs'*/ 

import { Readable } from 'stream';


import ReadLine  from 'readline';


import multer from 'multer';
import { client } from './database/client';

const multerConfig = multer();

const router = Router();

type Product = {
    code_bar: string;
    description: string;
    price: number;
    quantity: number;
}

router.post("/products", multerConfig.single("file"), 
    async (request: Request, response: Response) => {

    const { file } = request;
    const buffer = file?.buffer;


    const readableFile = new Readable();

    readableFile.push(buffer);
    readableFile.push(null);

    //inserir o readableFile ja com o buffer no readLine
    const producsLine = ReadLine.createInterface({
        input: readableFile
    })

    const products: Product[] = [];   

    for await (let line of producsLine) {
        
        const productLineSplit = line.split(',');

        products.push({
            code_bar: productLineSplit[0],
            description: productLineSplit[1],
            price: Number(productLineSplit[2]),
            quantity: Number(productLineSplit[3])

        })
    }

    for await ( let { code_bar, description, price, quantity } of products) {
        await client.products.create({
            data: {
                code_bar,
                description,
                price,
                quantity
            }
        })
    }

    console.log(products);

    return response.json(products);

})

export { router };