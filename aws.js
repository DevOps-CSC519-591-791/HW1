// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');

// Load FileSystem for Node.js API
var fs = require('fs');

// Set your region for future requests.
AWS.config.region = 'us-east-1';
var ec2 = new AWS.EC2();

var params = {
  ImageId: 'ami-c70f90d0', // Ubuntu Server 14.04 LTS trusty, amd64 EBS
  InstanceType: 't1.micro',
  KeyName: 'DevOps-AWS',   // Use existed keypair
  MinCount: 1, MaxCount: 1
};

// Create the instance
ec2.runInstances(params, function(err, data) {
  if (err) { 
  	console.log("Could not create instance", err); return;
  }

  var instanceId = data.Instances[0].InstanceId;
  console.log("Created instance", instanceId);
  
  // Add tags to the instance
  params = {Resources: [instanceId], Tags: [
    {Key: 'Name', Value: 'DevOps-HW1'}
  ]};
  ec2.createTags(params, function(err) {
    console.log("Tagging instance", err ? "failure" : "success");
  });

  // Wait for instance running and fetch public ip address
  var params = { InstanceIds: [instanceId] };
  ec2.waitFor('instanceExists', params, function(err, data) {
    if (err) console.log(err, err.stack);
    else {
      var ipAddress = data.Reservations[0].Instances[0].PublicIpAddress;
      console.log("\nInstance detail:");
      console.log("\nPublic IP Address:", ipAddress);

      // Concatenate Inventory record
      // eg. node0 ansible_host=192.168.1.103 ansible_user=vagrant ansible_ssh_private_key_file=./keys/node0.key
      var str1 = "[Web_Servers]\nnode0 ansible_host=";
      var str2 = " ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/DevOps-AWS.pem";
      var record = str1.concat(ipAddress, str2);
      // Create Inventory file
      fs.writeFile("Inventory", record, function(err) {
          if(err) {
              return console.log(err);
          }
          console.log("Inventory is updated successfully!");
      });
    }    
  });
});
