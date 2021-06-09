import React,{useState, useEffect} from 'react'
import { InputLabel, Select, MenuItem, Button, Grid, Typography } from "@material-ui/core";
import { useForm, FormProvider } from "react-hook-form";
import FormInput from "./FormInput"; 
import { commerce } from "../../lib/commerce";
import { Link } from "react-router-dom";

const AddressForm = ({checkoutToken, next}) => {
    const [shippingCountries, setShippingCountries] = useState([]);
    const [shippingCountry, setShippingCountry] = useState("");
    const [shippingSubDivisions, setShippingSubDivisions] = useState([]);
    const [shippingSubDivision, setShippingSubDivision] = useState("");
    const [shippingOptions, setShippingOptions] = useState([]);
    const [shippingOption, setShippingOption] = useState("");
    
    const countries = Object.entries(shippingCountries).map(([code, name]) => ({ id:code, label:name}));
    const subdivisions = Object.entries(shippingSubDivisions).map(([code, name]) => ({ id:code, label:name}));
    const options = shippingOptions.map((sO)=>({id: sO.id, label:`${sO.description} - (${sO.price.formatted_with_symbol})`}))
    const methods = useForm();

    const fetchShippingCountries = async(checkTokenId)=>{
        const {countries} = await commerce.services.localeListShippingCountries(checkTokenId);
        setShippingCountries(countries);
        setShippingCountry(Object.keys(countries)[0]); 
    }
    const fetchSubDivisions = async(countryCode)=>{
        const {subdivisions} = await commerce.services.localeListSubdivisions(countryCode);
        setShippingSubDivisions(subdivisions);
        setShippingSubDivision(Object.keys(subdivisions)[0]);     
    }
    const fetchShippingOptions = async(checkoutTokenId, country, region=null) => {
        const options = await commerce.checkout.getShippingOptions(checkoutTokenId, {country, region});
        setShippingOptions(options);
        setShippingOption(options[0].id);
    }

    useEffect(() => {
        fetchShippingCountries(checkoutToken.id);
    }, [])
    
    useEffect(() => {
    if(shippingCountry) fetchSubDivisions(shippingCountry);
    }, [shippingCountry]);
    
    useEffect(() => {
       if(shippingSubDivision) fetchShippingOptions(checkoutToken.id,shippingCountry, shippingSubDivision);
    }, [shippingSubDivision])

    return (
        <>
            <Typography variant="h6" gutterBottom>Shipping Address</Typography>
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit((data)=> next({...data, shippingCountry, shippingSubDivision, shippingOption}))}>
                    <Grid container spacing={3}>
                        <FormInput name="firstName" label="First Name" />
                        <FormInput name="lastName" label="Last Name" />
                        <FormInput name="address1" label="Address" />
                        <FormInput name="email" label="Email" />
                        <FormInput name="city" label="City" />
                        <FormInput name="zip" label="Zip / Postal Code" />
                        <Grid item xs={12} sm={6}>
                            <InputLabel>Shipping Country</InputLabel>
                            <Select value={shippingCountry} fullWidth onChange={(e)=>setShippingCountry(e.target.value)}>
                                {countries.map((country)=>(
                                    <MenuItem key={country.id} value={country.id}>
                                        {country.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <InputLabel>Shipping Subdivision</InputLabel>
                            <Select value={shippingSubDivision} fullWidth onChange={(e)=>setShippingSubDivision(e.target.value)}>
                                {subdivisions.map((subDivision)=>(
                                    <MenuItem key={subDivision.id} value={subDivision.id}>
                                        {subDivision.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <InputLabel>Shipping Options</InputLabel>
                            <Select value={shippingOption} fullWidth onChange={(e)=> setShippingOption(e.target.value)}>
                                {options.map((option)=>(
                                        <MenuItem key={option.id} value={option.id}>
                                            {option.label}
                                        </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                    </Grid> 
                    <br />
                    <div style={{display:"flex", justifyContent:"space-between"}}>
                        <Button component={Link} to="/cart" variant="outlined"> Back to Cart </Button>
                        <Button type="submit" variant="contained" color="primary"> Next </Button>
                    </div>
                </form>
            </FormProvider>
        </>
    )
}

export default AddressForm
