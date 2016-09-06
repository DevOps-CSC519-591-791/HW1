#!/bin/sh
export ANSIBLE_HOST_KEY_CHECKING=False
rm Inventory
node aws.js
node digital_ocean.js
ansible-playbook ansible-playbook.yml -i Inventory