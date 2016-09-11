#!/bin/sh
# name: Zhewei Hu, UnityId: zhu6, Provisioning and Configuring Servers (AWS EC2 and DigitalOcean Droplet)
sudo npm install
export ANSIBLE_HOST_KEY_CHECKING=False
node aws.js
node digital_ocean.js
echo "\nWait for 1 minute..."
sleep 1m
ansible-playbook ansible-playbook.yml -i Inventory