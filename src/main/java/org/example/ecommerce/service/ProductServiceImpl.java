package org.example.ecommerce.service;

import org.example.ecommerce.config.AppConstants;
import org.example.ecommerce.exceptions.APIException;
import org.example.ecommerce.exceptions.ResourceNotFoundException;
import org.example.ecommerce.model.Cart;
import org.example.ecommerce.model.Category;
import org.example.ecommerce.model.Product;
import org.example.ecommerce.payload.ProductDTO;
import org.example.ecommerce.payload.ProductResponse;
import org.example.ecommerce.repositories.CartRepository;
import org.example.ecommerce.repositories.CategoryRepository;
import org.example.ecommerce.repositories.ProductRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ProductServiceImpl implements  ProductService {
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ModelMapper modelMapper;



    @Autowired
    private FileService fileService;

    @Value("${project.image:images/}")
    private String path;
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private CartService cartService;

    public ProductDTO addProduct(Long categoryId,ProductDTO productDTO){
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(()->
                        new ResourceNotFoundException("Category","categoryId",categoryId));
        boolean isProductNotPresent = true;
        List<Product> products = category.getProducts();
        if (products != null) {
            for (int i = 0; i < products.size(); i++) {
                if (products.get(i).getProductName().equals(productDTO.getProductName())) {
                    isProductNotPresent = false;
                    break;
                }
            }
        }
        if(isProductNotPresent){
            Product product =modelMapper.map(productDTO,Product.class);
            product.setImage("default.png");
            product.setCategory(category);
            double specialPrice= product.getPrice()-(product.getDiscount() * 0.01)* product.getPrice();
            product.setSpecialPrice(specialPrice);
            Product savedProduct = productRepository.save(product);
            return modelMapper.map(savedProduct,ProductDTO.class);
        }
        else{
            throw new APIException("Product already exist");
        }

    }

    @Override
    public ProductResponse getAllProducts(Integer pageNumber, Integer pageSize, String sortBy) {
        return getAllProducts(pageNumber, pageSize, sortBy, AppConstants.SORT_DIR);
    }

    @Override
    public ProductResponse getAllProducts(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
       Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc")
               ?Sort.by(sortBy).ascending():Sort.by(sortBy).descending();
       Pageable pageDetails = PageRequest.of(pageNumber , pageSize , sortByAndOrder);
        Page<Product> pageProducts = productRepository.findAll(pageDetails);
        // products size is 0 or not
       List<Product> products=pageProducts.getContent();
       List<ProductDTO> productDTOS= products.stream()
               .map(product -> modelMapper.map(product, ProductDTO.class))
               .toList();

       ProductResponse productResponse=new ProductResponse();
       productResponse.setContent(productDTOS);
       productResponse.setPageNumber(pageProducts.getNumber());
       productResponse.setPageSize(pageProducts.getSize());
       productResponse.setTotalElements(pageProducts.getTotalElements());
       productResponse.setTotalPages(pageProducts.getTotalPages());
       productResponse.setLastPage(pageProducts.isLast());
       return productResponse;
    }

    @Override
    public ProductResponse searchByCategory(Long categoryId, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        // products size is 0 or not
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(()->
                        new ResourceNotFoundException("Category","categoryId",categoryId));
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc")
                ?Sort.by(sortBy).ascending():Sort.by(sortBy).descending();
        Pageable pageDetails = PageRequest.of(pageNumber , pageSize , sortByAndOrder);
        Page<Product> pageProducts = productRepository.findByCategory(category,pageDetails);
        // products size is 0 or not
        List<Product> products=pageProducts.getContent();


        List<ProductDTO> productDTOS= products.stream()
                .map(product -> modelMapper.map(product, ProductDTO.class))
                .toList();
        ProductResponse productResponse=new ProductResponse();
        productResponse.setContent(productDTOS);
        productResponse.setPageNumber(pageProducts.getNumber());
        productResponse.setPageSize(pageProducts.getSize());
        productResponse.setTotalElements(pageProducts.getTotalElements());
        productResponse.setTotalPages(pageProducts.getTotalPages());
        productResponse.setLastPage(pageProducts.isLast());
        return productResponse;
    }

    @Override
    public ProductResponse searchProductByKeyword(String keyword, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        // products size is 0 or not
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc")
                ?Sort.by(sortBy).ascending():Sort.by(sortBy).descending();
        Pageable pageDetails = PageRequest.of(pageNumber , pageSize , sortByAndOrder);
        Page<Product> pageProducts = productRepository.findByProductNameLikeIgnoreCase("%" + keyword + "%",pageDetails);

        List<Product> products = pageProducts.getContent();
        List<ProductDTO> productDTOS= products.stream()
                .map(product -> modelMapper.map(product, ProductDTO.class))
                .toList();
        if(products.size() == 0){
            throw new APIException("Products not found with keyword: " + keyword);
        }
        ProductResponse productResponse=new ProductResponse();
        productResponse.setContent(productDTOS);
        productResponse.setPageNumber(pageProducts.getNumber());
        productResponse.setPageSize(pageProducts.getSize());
        productResponse.setTotalElements(pageProducts.getTotalElements());
        productResponse.setTotalPages(pageProducts.getTotalPages());
        productResponse.setLastPage(pageProducts.isLast());
        return productResponse;
    }

    @Override
    public ProductDTO updateProduct(Long productId,  ProductDTO productDTO) {
        Product productFromDb =productRepository.findById(productId)
                .orElseThrow(()-> new ResourceNotFoundException("Product","productId",productId));
        Product product =modelMapper.map(productDTO,Product.class);
        // update the product one in request body
        productFromDb.setProductName(product.getProductName());
        productFromDb.setDescription(product.getDescription());
        productFromDb.setQuantity(product.getQuantity());
        productFromDb.setDiscount(product.getDiscount());
        productFromDb.setPrice(product.getPrice());
        double specialPrice = productFromDb.getPrice()
                - (productFromDb.getDiscount() * 0.01) * productFromDb.getPrice();
        productFromDb.setSpecialPrice(specialPrice);

        Product savedProduct= productRepository.save(productFromDb);

        List<Cart> carts = cartRepository.findCartsByProductId(productId);
        carts.forEach(cart -> cartService.updateProductInCarts(cart.getCartId(), productId));

        return modelMapper.map(savedProduct,ProductDTO.class);
    }

    @Override
    public ProductDTO deleteProduct(Long productId) {
        Product productFromDb =productRepository.findById(productId)
                .orElseThrow(()-> new ResourceNotFoundException("Product","productId",productId));
        productRepository.delete(productFromDb);

        return modelMapper.map(productFromDb,ProductDTO.class);
    }

    @Override
    public ProductDTO updateProductImage(Long productId, MultipartFile image) throws IOException {
        // Get the product from the db
        Product productFromDb = productRepository.findById(productId)
                .orElseThrow(()-> new ResourceNotFoundException("Product","ProductId",productId));
        // Upload the image to the server
        // Get the file name of uploaded image
        String fileName = fileService.uploadImage(path , image);

        // Updating the new file product to DTO
        productFromDb.setImage(fileName);

        // Save the updated product
        Product updatedProduct = productRepository.save(productFromDb);
        // return DTO after mapping product to DTO
        return modelMapper.map(updatedProduct , ProductDTO.class);
    }



}
