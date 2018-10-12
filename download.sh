#!/bin/bash
rm ./data/mayorsfoodcourt.csv
wget -O ./data/mayorsfoodcourt.csv "https://data.boston.gov/dataset/03693648-2c62-4a2c-a4ec-48de2ee14e18/resource/4582bec6-2b4f-4f9e-bc55-cbaa73117f4c/download/mayorsfoodcourt.csv"
rm ./data/FoodViolationData.csv
Rscript ConvertData.R