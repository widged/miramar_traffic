hack_miramar
============

Code for traffic Analysis. Developed at the @HackMiramar event on Nov 1.


## Getting started

Assuming that you already downloaded or cloned the repository from github:

``` shell

   git clone https://github.com/widged/miramar_traffic

```

Move into the `miramar_traffic` directory and install dependencies.

``` shell

   cd miramar_traffic
   mkdir data
   npm install

```

## Parsing Wellington Sensor Data

Run

``` shell

   ./sensor_stream.js 
   mkdir data/cypher
   mkdir data/route 

```

Requires 
 
  * data/wellington_sensor_data_October_2014.csv
  * cyper and route subdirectories in the data folder. 

 These sensor data are not bundled within this archive due to the huge size (20GB). They can be downloaded from the Hack Miramar wiki. https://hack-miramar.wikispaces.com/Data+Sources. Select https://isisgroup.app.box.com/hackmiramar, Hackathon > Araflow Sensors > wellington_sensor_data_October_2014.zip. 


## Importing the sensor data into neo4j graph database

Run

``` shell
   
   npm run neo_start
   ./neo_import.js  

```

Requires 

  * data/cypher/f_*.txt. Run `./sensor_stream.js` to generate these data.
  * An install of neo4j-community-2.1.5 in the `miramar_traffic` directory. 


##  Installing Neo4j Community version

Got Java? You’ll need either Oracle JDK 7 or OpenJDK 7 
  * MacOS: do not be fooled by Apple’s offer to install Java 6. That won’t work. 
  * Windows Enterprise: install your preferred JDK 7. 
  * Windows Community: the installer has the Java you need

Download Neo4j
 * head to: http://neo4j.com/download/.

Start Neo4j
  * Windows: run the installer. Double-click and enjoy.
  * MacOS & Linux: open a terminal, cd to the extracted folder, start with bin/neo4j start
  * Open http://localhost:7474 in a browser window.
