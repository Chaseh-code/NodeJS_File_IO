const fs = require('fs');
const path = require('./dirpath.js');

function main(){
    const OUTPUT_FILENAME = 'test.csv';
    const HEADERS = ["TRN Size", "TRN Value", "Payer", "RemitDate", "PLB", "PLB Codes ID", "PLB Values", "Monies"];
    const TRN = "TRN";
    const PLB = "PLB";
    const trnMap = new Map();
    const plbMap = new Map();
    let files;
    let payer;
    let remitDate;
    let data;
    let dataSet = [];
    let result = [];
    let resultSet = [];
    let it;

    console.log("Start!!");

    /*** Gets the full list of files***/
    files = fs.readdirSync(path,(err,files) => {
        if(err) { console.log(err); return err;}
    });
    //console.log(files.length);

    /*** Looping through all the files and grabbing the pertaining remit info ***/
    for(let i = 0; i < files.length; i++){
        dataSet = [];
        trnMap.clear();
        plbMap.clear();
        payer = getPayerName(files[i]);
        remitDate = getRemitDate(files[i]);
        /*** Data from EDI files is delimited by ~, parsing that out to have arrays to work with ***/
        data = fs.readFileSync(path.concat("\\",files[i]), 'utf8').split("~"); 

        /*** Further splitting the data up inside by delmiting by '*' ***/
        for(let x of data){
            dataSet.push(x.split("*"));
        }

        /*** Finding all the TRN & PLB data in each file ***/
        dataSet.forEach((ele, i) => {
            if(ele[0].trim() == TRN){
                trnMap.set(i, ele[2]);
            }
            else if(ele[0].trim() == PLB){
                plbMap.set(i, ele);
            }
        });

        /*** If there was no PLB data inside the file than we can skip adding it to the final output ***/
        it = trnMap.values().next().value;
        if(plbMap.size < 1){continue;}

        /*** Trying to see how many TRNs & PLBs max out of all the files */
        /*** Loading up data to modify before output ***/
        plbMap.forEach((value,key)=>{
            result = [];
            result.push(trnMap.size);
            result.push(it);
            result.push(payer);
            result.push(remitDate);
            result.push(value);
            resultSet.push(result.flat());
        });
    }

    /*** Cleaning out garbage data not wanted and helping format the final output ***/
    for(let i = 0; i < resultSet.length; i++){
        resultSet[i] = cleanGarbageData(resultSet[i]).flat();
        /*** Pieceing out multiple PLBs associated on one line into its own line, to make excel manipulation easier ***/
        if(resultSet[i].length > 8){
            for(let c = 8; c < resultSet[i].length; c+=3){
                //resultSet.push(resultSet[i].slice(0,5).concat(resultSet[i].slice(c,c+3))); //For some reasons concat 2 slices does not return as expected
                result = [];
                result.push(resultSet[i].slice(0,5));
                result.push(resultSet[i].slice(c,c+3));
                resultSet.push(result);
            }
            resultSet[i].splice(8);
        }
    }

    /*** Transforming data into csv format***/
    for(let c = 0; c < resultSet.length; c++){
        for(let i = 0; i < resultSet[c].length; i++){
            if(i == 0){ /*** Cleaning up spacing for formatting so that it comes out the csv file better ***/
                resultSet[c][i] = `\n${resultSet[c][i].toString()}`;
            /*** The PLB from the file had extra spacing, removing that to have cleaner csv output ***/
            } else if(i == 4){
                resultSet[c][i] = resultSet[c][i].trimStart();
            }
         }
    }

    /*** Adding Header Names ***/
    resultSet.unshift(HEADERS);

    /*** Outputting to the final file. Formatting into CSV for easier import into GoogleSpreadsheet ***/
    fs.writeFileSync(OUTPUT_FILENAME, `${resultSet}`);

    console.log("Done!!!");
}

/*** Grabs the payer's name from the filename***/
function getPayerName(filename){
    return filename.substring(0, filename.indexOf("_"));
}

/*** Grabs the date from the filename ***/
function getRemitDate(filename){
    let pattern = /\d/;
    let digitString = filename.match(pattern);
    let digitIndex = filename.indexOf(digitString);
    return filename.substring(digitIndex, digitIndex + 8);
}

/*** Cleaning out the garbage from the PLB codes***/
function cleanGarbageData(array){
    let data = [];
    let result;
    array.splice(5,2); // removing 2 garbage data
    result = array.slice(0,5); 
    for(let i = 5; i < array.length; i++){
        (i%2 != 0) ? data.push(splitPlbCodes(array[i])) : data.push(array[i]);
    }
    result.push(data);
    return result.flat();
}

/*** Dealing with splitting off the PLB code ID & the code itself***/
function splitPlbCodes(element) {
    return ((element.length <= 2) ? [element, null] : element.split(">"));
}

/*** Executing the code ***/
main();