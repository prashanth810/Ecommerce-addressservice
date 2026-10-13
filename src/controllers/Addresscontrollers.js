import AddressModel from "../models/AddressModel.js";

// add address
const AddAddress = async (req, res) => {
    const { full_name, phone, building_number, street, landmark, city, state, pincode, country, address_type, is_default } = req.body;

    try {
        const user = req?.user?.id;

        const existaddress = await AddressModel.findOne({ building_number });

        if (existaddress) {
            return res.status(409).json({ success: false, message: "address already exist !!!" });
        }

        if (!user) {
            return res.status(401).json({ success: false, message: "User not Unauthorized !!!" });
        }

        if (!full_name || full_name.trim() === "") {
            return res.status(400).json({ success: false, message: "full name is required !!!" });
        }

        if (!phone || phone.trim() === "") {
            return res.status(400).json({ success: false, message: "phone number is required !!!" });
        }

        if (!building_number || building_number.trim() === "") {
            return res.status(400).json({ success: false, message: "building number is required !!!" });
        }

        if (!street || street.trim() === "") {
            return res.status(400).json({ success: false, message: "street is required !!!" });
        }

        if (!landmark || landmark.trim() === "") {
            return res.status(400).json({ success: false, message: "land mark is required !!!" });
        }

        if (!pincode || pincode.trim() === "") {
            return res.status(400).json({ success: false, message: "Pincode is required" });
        }

        if (!address_type || address_type.trim() === "") {
            return res.status(400).json({ success: false, message: "address type is required !!!" });
        }

        const formattedAddressType = address_type.trim().toLowerCase();

        if (formattedAddressType !== "home" && formattedAddressType !== "work" && formattedAddressType !== "other") {
            return res.status(400).json({ success: false, message: "Address type must be home, work, or other !!!" });
        }

        const addressCount = await AddressModel.countDocuments({ userId: user });

        let defaultvalues = is_default;

        if (addressCount >= 3) {
            return res.status(400).json({
                success: false,
                message: "You can add a maximum of 3 addresses only!"
            });
        }

        // If this is the user's first address, make it default
        if (addressCount === 0) {
            defaultvalues = true;
        }


        if (defaultvalues) {
            await AddressModel.updateMany(
                { userId: user },
                { $set: { is_default: false } },
            );
        }

        const newaddress = await AddressModel.create({
            userId: user,
            full_name,
            phone,
            building_number,
            street,
            landmark,
            city,
            state,
            pincode,
            country: country || "India",
            address_type: formattedAddressType,
            is_default: Boolean(defaultvalues),
        });

        return res.status(201).json({ success: true, message: "Address created successfully !!!", data: newaddress });

    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// remove address
const Deleteaddress = async (req, res) => {
    const { id } = req.params;
    try {
        const user = req?.user?.id;
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found unauthorized !!" });
        }

        const address = await AddressModel.findByIdAndDelete({ _id: id, userId: user });

        if (!address) {
            return res.status(404).json({ success: false, message: "Address not found or you are not authorized to delete this address !!" });
        }

        return res.status(200).json({
            success: true, message: "Address deleted successfully !!",
        });

    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// update address 
const Updateaddress = async (req, res) => {
    const { id } = req.params;
    const { full_name, phone, building_number, street, landmark, city, state, pincode, country, address_type, is_default } = req.body;

    try {
        const user = req?.user?.id;

        const address = await AddressModel.findById(id);

        if (!address) {
            return res.status(404).json({ success: false, message: "Address not avaibale !!!" });
        }

        if (!user) {
            return res.status(400).json({ success: false, message: "User not authorized !!!" });
        }

        let updatedata = {};

        if (full_name) updatedata.full_name = full_name;
        if (phone) updatedata.phone = phone;
        if (building_number) updatedata.building_number = building_number;
        if (street) updatedata.street = street;
        if (landmark) updatedata.landmark = landmark;
        if (city) updatedata.city = city;
        if (state) updatedata.state = state;
        if (pincode) updatedata.pincode = pincode;
        if (country) updatedata.country = country;
        if (address_type) updatedata.address_type = address_type;

        if (is_default === true) {
            await AddressModel.updateMany(
                { userId: user },
                { $set: { is_default: false } }
            )
            updatedata.is_default = true;
        }

        const updatedaddress = await AddressModel.findOneAndUpdate({ _id: id, userId: user },
            updatedata,
            { new: true },
        )

        return res.status(200).json({
            success: true,
            message: "Address updated successfully",
            data: updatedaddress
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}


// get all address list 
const GetAllAddress = async (req, res) => {
    try {
        const user = req?.user?.id;
        const address = await AddressModel.find({ userId: user });

        if (!address) {
            return res.status(404).json({ success: false, message: "address not found" })
        }

        return res.status(200).json({
            success: true, message: "address fetched successfully", data: address,
            total: address.length
        })
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// get single address 
const Getsingleaddress = async (req, res) => {
    const { id } = req.params;
    try {
        const user = req?.user?.id;

        const address = await AddressModel.find({ _id: id, userId: user });

        if (!address) {
            return res.status(404).json({ success: false, message: "address not found !!!" })
        }
        return res.status(200).json({
            success: true,
            data: address,
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// changing address model is default
const makeitdefault = async (req, res) => {
    const { addressId, is_default } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!addressId) {
        return res.status(400).json({ success: false, message: "addressId is required" });
    }

    if (typeof is_default !== "boolean") {
        return res.status(400).json({ success: false, message: "is_default must be true or false" });
    }

    try {
        // only matches if the address belongs to this user
        const updatedaddress = await AddressModel.findOneAndUpdate(
            { _id: addressId, userId },
            { $set: { is_default } },
            { new: true }
        );

        if (!updatedaddress) {
            return res.status(404).json({ success: false, message: "Address not found or unauthorized" });
        }

        // only one default per user: unset the others of this same user
        if (is_default) {
            await AddressModel.updateMany(
                { userId, _id: { $ne: addressId } },
                { $set: { is_default: false } }
            );
        }

        return res.status(200).json({
            success: true,
            message: "Default updated successfully",
            data: updatedaddress,
        });
    } catch (error) {
        // invalid ObjectId format
        if (error.name === "CastError") {
            return res.status(400).json({ success: false, message: "Invalid address id" });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};


export { AddAddress, Deleteaddress, Updateaddress, GetAllAddress, Getsingleaddress, makeitdefault };