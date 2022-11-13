# Purpose is to read all the files in a directory and output data into a easy excel manipulation formatting

The main functionality of the program reads in all the txt files in a single directory to make a collective list.
Once the data is read in it is broken down from its delimited state into single columns, removing all unnecessary data along the way.

## Prerequisites for running the code

1. Must have at least nodejs v16 or higer installed. [NodeJS Installer](https://nodejs.org/en/download/)
1. Must update the `path` string inside the `dirpath.js` file to the folder where you are storing your .txt files for processing. May need to double backslash (\\\\) in order to correctly call the file pathway. <br>Confirmed that this does work with Google Drive's Windows FileExplorer extension application.
1. Can update line **5** in `main.js` if you wish your file name to output as something specific, otherwise it will output as `test.csv`. <br>Must keep it a .csv file format though.

## Running the code

1. Open a cmd to the filepath where main.js & dirpath.js are stored. Execute main.js<br> EX: `node main.js`
1. Recommend uploading the csv file into GoogleSpreadsheets for easier data manipulation.
