#!/bin/bash

wget https://brouter.de/brouter/segments4 -q -O - | ggrep -Po '(?<=")(\w+\d+_\w+\d+.rd5)' | sed 's/^/https:\/\/brouter.de\/brouter\/segments4\//' > linksfinal.txt
mkdir tmp
cd tmp
wget -i ../linksfinal.txt
cd ..
rm -rf segments4
mv tmp segments4
rm linksfinal.txt