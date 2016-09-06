require 'droplet_kit'

token=ENV['TOKEN']
client = DropletKit::Client.new(access_token: token)

ssh_keys = client.ssh_keys.all
ssh_keys.each {|key| puts key.inspect}
