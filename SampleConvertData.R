library(data.table)

fread("./data/SampleFoodViolData.csv", stringsAsFactors=F) -> food_viola
head(food_viola)


library(magrittr)
library(plyr)


filtered <- dplyr::filter(food_viola, ViolStatus == 'Fail' & Location != '')

df<- ddply(filtered,
           .(businessName, LegalOwner, NameLast, NameFirst, LICENSENO, Address, CITY, STATE, ZIP, Location),
           summarise,
           Severit = length(businessName))

df <- df %>% tidyr::extract(Location, c("lat", "lng"), "\\(([^,]+), ([^)]+)\\)")

write.table(df, file = "./data/SampleMyData.csv", sep=",",row.names=FALSE)