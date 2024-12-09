VERSION=$(grep '^version = ' Nargo.toml | cut -d '"' -f 2)
echo "Circuit version: $VERSION"

echo "Compiling circuit..."
if ! nargo compile; then
    echo "Compilation failed. Exiting..."
    exit 1
fi

echo "Gate count:"
bb gates -b target/main.json | jq  '.functions[0].circuit_size'

mkdir -p target/$VERSION

echo "Copying main.json to target/$VERSION..."
cp target/main.json target/$VERSION/main.json

echo "Generating vkey..."
bb write_vk_ultra_honk -b ./target/main.json -o ./target/vk

echo "Generating vkey.json to target/$VERSION..."
node -e "const fs = require('fs'); fs.writeFileSync('./target/$VERSION/vkey.json', JSON.stringify(Array.from(Uint8Array.from(fs.readFileSync('./target/vk')))));"

echo "Done"